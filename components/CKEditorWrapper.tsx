'use client'

import { CKEditor } from '@ckeditor/ckeditor5-react'
import { 
  ClassicEditor, Essentials, Paragraph, Bold, Italic, 
  Heading, List, Link 
} from 'ckeditor5'
import 'ckeditor5/ckeditor5.css'

interface CKEditorWrapperProps {
  data: string
  onChange: (data: string) => void
  placeholder?: string
}

export default function CKEditorWrapper({ 
  data, 
  onChange, 
  placeholder = '請輸入文章內容...' 
}: CKEditorWrapperProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <CKEditor
        editor={ClassicEditor}
        data={data}
        config={{
          plugins: [Essentials, Paragraph, Bold, Italic, Heading, List, Link],
          toolbar: [
            'undo', 'redo', '|',
            'bold', 'italic', '|',
            'heading', '|',
            'bulletedList', 'numberedList', '|',
            'link'
          ],
          placeholder,
          // licenseKey: 'YOUR_KEY_HERE' // 基本開源功能可省略
        }}
        onChange={(_, editor) => {
          onChange(editor.getData())
        }}
      />
    </div>
  )
}