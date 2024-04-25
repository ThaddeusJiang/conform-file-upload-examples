import { getInputProps, useForm } from "@conform-to/react"
import { parseWithZod } from "@conform-to/zod"

import { Form } from "@remix-run/react"
import { useRef, useState } from "react"
import { z } from "zod"

const schema = z.object({
  files: z
    .unknown() // I know the instance, should be File or File[], not FileList.
    .refine((value) => {
      const files = Array.isArray(value) ? value : [value]
      return files.length > 1
    }, "At least 2 file is required")
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

  const inputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<File[]>(() => {
    if (!fields.files.value) {
      return []
    }
    return Array.isArray(fields.files.value) ? fields.files.value : [fields.files.value]
  })

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return

    const newFiles = Array.from(e.target.files)
    setFiles(newFiles)
    form.update({
      name: fields.files.name,
      // @ts-expect-error conform-to types are not up to date
      files: newFiles,
    })

    const fileList = new DataTransfer()
    newFiles.forEach((file) => fileList.items.add(file))
    inputRef.current!.files = fileList.files
  }

  const handleDelete = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    setFiles(newFiles)
    form.update({
      name: fields.files.name,
      // @ts-expect-error conform-to types are not up to date
      files: newFiles,
    })

    const fileList = new DataTransfer()
    newFiles.forEach((file) => fileList.items.add(file))
    inputRef.current!.files = fileList.files
  }

  return (
    <Form
      method="POST"
      encType="multipart/form-data"
      id={form.id}
      onSubmit={form.onSubmit}
      className="form-control container max-w-screen-sm mx-auto p-4 bg-white shadow-lg rounded-lg mt-8"
    >
      <div>
        <br />
        <section className="grid grid-cols-4 gap-4 place-items-center">
          {files.map((file, index) => (
            <div key={file.name + index} className="w-[120px]">
              {/* <img src={URL.createObjectURL(file)} alt={file.name} className="w-[120px] h-[170px]" /> */}
              <div className="w-[120px] h-[170px] bg-[#D9D9D9]" />
              <div className="mt-2 flex justify-between items-center w-full max-w-full">
                <div title={file.name} className="text-xs grow truncate text-pretty">
                  {file.name}
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    handleDelete(index)
                  }}
                  className="grow-0 btn btn-ghost !text-error btn-circle btn-xs"
                >
                  x
                </button>
              </div>
            </div>
          ))}
        </section>

        <div className=" mt-4 text-error">
          {Object.entries(fields.files.allErrors).flatMap(([, messages]) => messages)}
        </div>

        <label htmlFor={fields.files.id} className=" btn mt-4">
          Select Files (Max 10MB)
          <input
            ref={inputRef}
            onChange={onChange}
            {...getInputProps(fields.files, { type: "file" })}
            multiple
            hidden
          />
        </label>
      </div>
    </Form>
  )
}
