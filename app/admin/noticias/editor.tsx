"use client";

import { useRef, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { getAdminClient, uploadFile } from "../../../lib/admin-client";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill-new");
    return function comp({ forwardedRef, ...props }: any) {
      return <RQ ref={forwardedRef} {...props} />;
    };
  },
  { ssr: false, loading: () => <p>Carregando editor...</p> }
);

export default function Editor({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  const quillRef = useRef<any>(null);

  const imageHandler = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        try {
          const client = getAdminClient();
          // Using bucket 'covers' as it's the one we know works and allows public access
          const path = await uploadFile(client, "covers", file, "posts-inline");
          const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${path}`;
          
          const quill = quillRef.current?.getEditor();
          if (quill) {
            const range = quill.getSelection(true);
            quill.insertEmbed(range.index, "image", url);
          }
        } catch (err) {
          console.error("Falha ao subir imagem inline:", err);
          alert("Falha no upload da imagem");
        }
      }
    };
  }, []);

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [2, 3, false] }],
          ["bold", "italic", "underline", "strike", "blockquote"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link", "image", "video"],
          ["clean"],
        ],
        handlers: {
          image: imageHandler,
        },
      },
    }),
    [imageHandler]
  );

  return (
    <div style={{ backgroundColor: "#fff", color: "#000" }}>
      <ReactQuill
        forwardedRef={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
      />
    </div>
  );
}
