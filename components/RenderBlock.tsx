/* eslint-disable @next/next/no-img-element */
'use client';

import React, { Component, ReactNode } from 'react';

// Error Boundary for rendering individual question blocks safely
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class BlockErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('BlockErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-2 bg-rose-50 text-rose-700 text-xs rounded border border-rose-200 font-mono">
            [Error rendering block element]
          </div>
        )
      );
    }
    return this.props.children;
  }
}

// Helper to render math/LaTeX strings or clean formatted text
export function RenderMathText({ text, className = '' }: { text?: string; className?: string }) {
  if (!text) return null;

  // Simple math text parser for standard LaTeX tokens like \frac, x^2, \alpha, etc.
  // Replaces common math tokens into formatted spans or superscripts
  const formattedText = text
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1/$2)')
    .replace(/\^(\d+|[a-zA-Z])/g, '<sup>$1</sup>')
    .replace(/_(\d+|[a-zA-Z])/g, '<sub>$1</sub>')
    .replace(/\\times/g, '×')
    .replace(/\\div/g, '÷')
    .replace(/\\pm/g, '±')
    .replace(/\\neq/g, '≠')
    .replace(/\\leq/g, '≤')
    .replace(/\\geq/g, '≥')
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\theta/g, 'θ')
    .replace(/\\pi/g, 'π')
    .replace(/\\\(/g, '')
    .replace(/\\\)/g, '')
    .replace(/\$\$/g, '')
    .replace(/\$/g, '');

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: formattedText }}
    />
  );
}

export interface QuestionBlock {
  type: 'text' | 'markdown' | 'image' | 'img' | 'svg' | 'code' | string;
  content?: string;
  src?: string;
  alt?: string;
  code?: string;
  lang?: string;
}

export function RenderBlock({ block }: { block: QuestionBlock }) {
  if (!block) return null;

  return (
    <BlockErrorBoundary>
      <div className="my-1.5">
        {(block.type === 'text' || block.type === 'markdown') && block.content && (
          <RenderMathText text={block.content} className="text-xs sm:text-sm text-slate-700 leading-relaxed block" />
        )}

        {(block.type === 'image' || block.type === 'img') && (block.src || block.content) && (
          <img
            src={block.src || block.content}
            alt={block.alt || 'Question figure'}
            className="max-w-full h-auto rounded-xl border border-slate-200 shadow-2xs my-2 max-h-80 object-contain mx-auto"
            referrerPolicy="no-referrer"
          />
        )}

        {block.type === 'svg' && block.content && (
          <div
            className="my-2 p-2 bg-slate-50 rounded-xl border border-slate-200 overflow-x-auto flex justify-center"
            dangerouslySetInnerHTML={{ __html: block.content }}
          />
        )}

        {block.type === 'code' && (block.code || block.content) && (
          <pre className="bg-slate-900 text-slate-100 text-xs p-3 rounded-xl overflow-x-auto font-mono my-2 border border-slate-800">
            <code>{block.code || block.content}</code>
          </pre>
        )}
      </div>
    </BlockErrorBoundary>
  );
}
