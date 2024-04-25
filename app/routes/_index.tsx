import { useForm } from "@conform-to/react"
import { parseWithZod } from "@conform-to/zod"

import { Form } from "@remix-run/react"
import { z } from "zod"

const schema = z.object({
  files: z
    .unknown() // I know the instance, should be File or File[], not FileList.
    .refine((value) => {
      const files = Array.isArray(value) ? value : [value]
      return files.length > 0
    }, "At least 1 file is required")
    .refine((value) => {
      const files = Array.isArray(value) ? value : [value]
      return files.every((file) => file.size < 1024 * 1024 * 10)
    }, "File size must be less than 10MB"),
})

export default function Example() {
  const [form, fields] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, { schema })
    },
    shouldValidate: "onInput",
  })

  return (
    <Form method="POST" encType="multipart/form-data" id={form.id} onSubmit={form.onSubmit}>
      <div>
        <label htmlFor={fields.files.id}>Multiple Files: </label>
        <br />
        <input type="file" name={fields.files.name} multiple />
        <div>{Object.entries(fields.files.allErrors).flatMap(([, messages]) => messages)}</div>
        {/* {fields.files.errors && <div>{fields.files.errors}</div>} */}
      </div>
      <button>Upload</button>
    </Form>
  )
}
