import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import {
  json,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  type MetaFunction,
} from "@remix-run/cloudflare";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useOutletContext,
} from "@remix-run/react";
import { createServerClient } from "@supabase/auth-helpers-remix";
import { TrashIcon } from "lucide-react";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from "~/components/ui/table";
import { Textarea } from "~/components/ui/textarea";
import type { RootContext } from "~/types/rootContext";
import type { Database } from "~/types/supabase";
import type { TypeSafeFormData } from "~/types/typeSafeFormData";

const schema = z.object({
  itemName: z.string().min(1).max(255),
  itemDescription: z.string().min(1).max(255).optional(),
});

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const response = new Response();
  let env: Env;
  try {
    env = process.env as unknown as Env;
  } catch {
    env = context.env as Env;
  }
  if (!(env.SUPABASE_URL && env.SUPABASE_ANON_KEY)) {
    throw new Error("SUPABASE_URL or SUPABASE_ANON_KEY is not defined");
  }
  const supabaseClient = createServerClient<Database>(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY,
    { request, response },
  );
  const { data } = await supabaseClient
    .from("todo_list")
    .select("*")
    .order("created_at");
  return json(
    { data },
    {
      headers: response.headers,
    },
  );
};

export async function action({ request, context }: ActionFunctionArgs) {
  const response = new Response();
  let env: Env;
  try {
    env = process.env as unknown as Env;
  } catch {
    env = context.env as Env;
  }

  if (!(env.SUPABASE_URL && env.SUPABASE_ANON_KEY)) {
    throw new Error("SUPABASE_URL or SUPABASE_ANON_KEY is not defined");
  }

  const supabaseClient = createServerClient<Database>(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY,
    { request, response },
  );
  const formData = (await request.formData()) as unknown as TypeSafeFormData<
    z.infer<typeof schema>
  >;
  const submission = parseWithZod(formData, { schema });
  const name = formData.get("itemName")?.toString();
  const description = formData.get("itemDescription")?.toString();
  const { error } = await supabaseClient.from("todo_list").insert({
    name,
    description,
  });
  if (error) {
    return json({ message: error.message, submission: submission.reply() });
  }
  return json({
    message: "Todo created successfully",
    submission: submission.reply(),
  });
}

export const meta: MetaFunction = () => {
  return [
    { title: "Todo List" },
    {
      name: "description",
      content: "A simple todo list app built with Remix.",
    },
  ];
};

export default function Index() {
  const actionData = useActionData<typeof action>();
  const loaderData = useLoaderData<typeof loader>();
  const { supabase } = useOutletContext<RootContext>();
  const navigate = useNavigate();
  const [form, fields] = useForm({
    lastResult: actionData?.submission,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
    shouldValidate: "onInput",
  });
  return (
    <div className="md:grid md:grid-cols-10 md:gap-4 w-full h-full">
      <div className="md:col-span-2 h-full text-center md:pl-5">
        <p className="text-3xl font-bold">Create Todo</p>
        <Form method="post" {...getFormProps(form)}>
          <div>
            <Label htmlFor={fields.itemName.id}>Name</Label>
            <Input
              {...getInputProps(fields.itemName, { type: "text" })}
              autoComplete="off"
            />
            <div>{fields.itemName.errors}</div>
          </div>
          <div>
            <Label htmlFor={fields.itemDescription.id}>Description</Label>
            <Textarea
              {...getInputProps(fields.itemDescription, { type: "text" })}
              autoComplete="off"
            />
            <div>{fields.itemDescription.errors}</div>
          </div>
          <Button type="submit" className="mt-4">
            Create Todo
          </Button>
        </Form>
      </div>
      <div className="md:col-span-8 h-full">
        <h1 className="text-3xl font-bold">Todo List</h1>
        <div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loaderData.data?.map((todo) => {
                return (
                  <TableRow key={todo.id}>
                    <TableCell>{todo.name}</TableCell>
                    <TableCell>{todo.description}</TableCell>
                    <TableCell>
                      <Checkbox
                        defaultChecked={todo.done}
                        onCheckedChange={async (checked: boolean) => {
                          await supabase
                            .from("todo_list")
                            .update({ done: checked })
                            .eq("id", todo.id);
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={async () => {
                          await supabase
                            .from("todo_list")
                            .delete()
                            .eq("id", todo.id);
                          navigate(".", { replace: true });
                        }}
                      >
                        <TrashIcon size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
