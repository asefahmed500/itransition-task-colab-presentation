"use client"

import { useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import rehypeSanitize from "rehype-sanitize"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism"

interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="animate-pulse h-40 bg-muted rounded-md" />
  }

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, rehypeSanitize]}
      components={{
        h1: ({ node, ...props }) => <h1 className="text-4xl font-bold mb-4" {...props} />,
        h2: ({ node, ...props }) => <h2 className="text-3xl font-bold mb-3" {...props} />,
        h3: ({ node, ...props }) => <h3 className="text-2xl font-bold mb-2" {...props} />,
        p: ({ node, ...props }) => <p className="mb-4 text-lg" {...props} />,
        ul: ({ node, ...props }) => <ul className="mb-4 list-disc pl-6" {...props} />,
        ol: ({ node, ...props }) => <ol className="mb-4 list-decimal pl-6" {...props} />,
        li: ({ node, ...props }) => <li className="mb-1 text-lg" {...props} />,
        blockquote: ({ node, ...props }) => (
          <blockquote className="border-l-4 border-primary pl-4 italic my-4" {...props} />
        ),
        a: ({ node, ...props }) => <a className="text-primary underline hover:text-primary/80" {...props} />,
        img: ({ node, ...props }) => (
          <img className="max-w-full h-auto rounded-md my-4" {...props} alt={props.alt || ""} />
        ),
        code: ({ node, inline, className, children, ...props }) => {
          const match = /language-(\w+)/.exec(className || "")
          return !inline && match ? (
            <SyntaxHighlighter style={tomorrow} language={match[1]} PreTag="div" className="rounded-md my-4" {...props}>
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          ) : (
            <code className="bg-muted px-1.5 py-0.5 rounded-md text-sm" {...props}>
              {children}
            </code>
          )
        },
        table: ({ node, ...props }) => (
          <div className="overflow-x-auto my-4">
            <table className="w-full border-collapse" {...props} />
          </div>
        ),
        thead: ({ node, ...props }) => <thead className="bg-muted" {...props} />,
        tr: ({ node, ...props }) => <tr className="border-b" {...props} />,
        th: ({ node, ...props }) => <th className="px-4 py-2 text-left font-bold" {...props} />,
        td: ({ node, ...props }) => <td className="px-4 py-2" {...props} />,
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

