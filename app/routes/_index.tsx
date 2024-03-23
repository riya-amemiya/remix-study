import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import {
  json,
  type ActionFunctionArgs,
  type MetaFunction,
} from "@remix-run/cloudflare";
import { Form, useActionData } from "@remix-run/react";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

const schema = z.object({
  itemName: z.string().min(1).max(255),
  description: z.string().min(1).max(255),
});

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema });
  const name = formData.get("itemName");
  console.log(name);
  return json({ message: `Hello, ${name}`, submission: submission.reply() });
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
  const data = useActionData<typeof action>();
  const [form, fields] = useForm({
    lastResult: data?.submission,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
    shouldValidate: "onInput",
  });
  return (
    <div>
      <h1 className="text-3xl font-bold">Todo List</h1>
      <Form method="post" {...getFormProps(form)}>
        <div>
          <Label htmlFor={fields.itemName.id}>Name</Label>
          <Input
            {...getInputProps(fields.itemName, { type: "text" })}
            autoComplete="off"
          />
          <div>{fields.itemName.errors}</div>
        </div>
        <Button type="submit">Create Todo</Button>
        {data ? data.message : "Waiting..."}
      </Form>
    </div>
  );
}
