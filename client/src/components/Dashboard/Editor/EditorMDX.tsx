// import { useEffect, useState, type ForwardedRef } from 'react'
// import {
//   headingsPlugin,
//   listsPlugin,
//   quotePlugin,
//   thematicBreakPlugin,
//   markdownShortcutPlugin,
//   MDXEditor,
//   type MDXEditorMethods,
//   type MDXEditorProps,
//   toolbarPlugin,
//   UndoRedo,
//   BoldItalicUnderlineToggles,
//   BlockTypeSelect,
//   diffSourcePlugin,
//   DiffSourceToggleWrapper,
//   ListsToggle,
//   InsertTable,
//   InsertImage,
//   Separator,
//   CreateLink,
//   InsertThematicBreak,
//   frontmatterPlugin,
//   InsertFrontmatter,
//   imagePlugin,
//   linkPlugin,
//   linkDialogPlugin,
//   tablePlugin
// } from '@mdxeditor/editor'
// import '@mdxeditor/editor/style.css'

// import axios from 'axios'
// import { getAccessToken } from '@/utils/utils'
// import { baseURL } from '@/constants/url'
// import { UploadOutlined } from '@ant-design/icons'

// export default function InitializedMDXEditor({
//   editorRef,
//   markdown: parentMarkdown,
//   onChange,
//   ...props
// }: { editorRef: ForwardedRef<MDXEditorMethods> | null } & MDXEditorProps) {
//   const token = getAccessToken()
//   const [markdown, setMarkdown] = useState<string>(parentMarkdown || '')
//   const [editorKey, setEditorKey] = useState<number>(0)

//   useEffect(() => {
//     if (markdown !== parentMarkdown) {
//       setMarkdown(parentMarkdown)
//     }
//   }, [parentMarkdown])

//   useEffect(() => {
//     if (onChange && parentMarkdown !== markdown) {
//       onChange(markdown, true)
//     }
//   }, [markdown, onChange, parentMarkdown])

//   const config = {
//     headers: {
//       'Content-Type': 'multipart/form-data',
//       Authorization: `Bearer ${token}`
//     }
//   }

//   async function imageUploadHandler(image: File): Promise<string> {
//     const formData = new FormData()
//     formData.append('files', image)

//     const response = await axios.post(`${baseURL}/v1/files/upload-user-files`, formData, config)
//     if (response.data && response.data[0].url) {
//       return response.data[0].url
//     } else {
//       throw new Error('URL not found in response')
//     }
//   }

//   const handleFileRead = (file: File) => {
//     const reader = new FileReader()
//     console.log('reader', reader)
//     reader.onload = (e) => {
//       if (e.target?.result && typeof e.target.result === 'string') {
//         setMarkdown(e.target.result)
//         setEditorKey((prevKey) => prevKey + 1)
//       }
//     }
//     reader.readAsText(file)
//   }

//   const handleDragOver = (e: React.DragEvent) => {
//     e.preventDefault()
//   }

//   const handleDrop = (e: React.DragEvent) => {
//     e.preventDefault()
//     const file = e.dataTransfer.files[0]
//     if (file && (file.name.endsWith('.md') || file.name.endsWith('.mdx'))) {
//       handleFileRead(file)
//     } else {
//       console.error('File is not a valid Markdown or MDX file.')
//     }
//   }

//   const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0]
//     if (file && (file.name.endsWith('.md') || file.name.endsWith('.mdx'))) {
//       handleFileRead(file)
//     } else {
//       console.error('File is not a valid Markdown or MDX file.')
//     }
//   }

//   // console.log('IM HERE')
//   // console.log(props)
//   // console.log('markdown', markdown)
//   const sanitizedMarkdown = typeof parentMarkdown === 'string' ? parentMarkdown : JSON.stringify(parentMarkdown)
//   return (
//     <div onDragOver={handleDragOver} onDrop={handleDrop} className='relative'>
//       <MDXEditor
//         key={editorKey}
//         contentEditableClassName='prose min-h-[70vh] overflow-y-auto max-w-full border border-gray-300 border-dashed '
//         className='mdx-editor-custom '
//         plugins={[
//           toolbarPlugin({
//             toolbarContents: () => (
//               <>
//                 <DiffSourceToggleWrapper>
//                   <UndoRedo />
//                   <BoldItalicUnderlineToggles />
//                   <Separator />

//                   <ListsToggle />
//                   <Separator />

//                   <BlockTypeSelect />
//                   <Separator />

//                   <CreateLink />
//                   <InsertImage />
//                   <Separator />

//                   <InsertTable />
//                   <Separator />
//                   <InsertThematicBreak />
//                   <InsertFrontmatter />
//                   <Separator />
//                 </DiffSourceToggleWrapper>
//               </>
//             )
//           }),
//           diffSourcePlugin({
//             diffMarkdown: 'An older version',
//             viewMode: 'rich-text'
//           }),
//           listsPlugin(),
//           quotePlugin(),
//           headingsPlugin(),
//           linkPlugin(),
//           linkDialogPlugin(),
//           imagePlugin(),
//           tablePlugin(),
//           thematicBreakPlugin(),
//           frontmatterPlugin(),
//           markdownShortcutPlugin(),
//           imagePlugin({ imageUploadHandler })
//         ]}
//         ref={editorRef}
//         markdown={sanitizedMarkdown}
//         onChange={(updatedMarkdown: string) => setMarkdown(updatedMarkdown)}
//         {...props}
//       />
//       <div className='mt-6'>
//         <label
//           htmlFor='markdown-file'
//           className='px-4 py-2 text-black border-[1px] duration-300 border-gray-300 hover:border-blue-500 hover:bg-blue-500 hover:text-white rounded cursor-pointer'
//         >
//           <UploadOutlined className='mr-2' />
//           Upload Markdown File
//         </label>
//         <input id='markdown-file' type='file' accept='.md, .mdx' onChange={handleFileImport} className='hidden' />
//       </div>
//     </div>
//   )
// }
