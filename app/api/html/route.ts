import { NextRequest, NextResponse } from "next/server";
import { INITIAL_BOOKS } from "@/lib/seed-data";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get("url") || searchParams.get("file");
  const bookId = searchParams.get("bookId");
  const type = searchParams.get("type") || "sample";
  const isSample = type === "sample" || targetUrl?.includes("sample");

  // Fetch external HTML if URL is provided
  if (targetUrl && (targetUrl.startsWith("http://") || targetUrl.startsWith("https://"))) {
    try {
      const res = await fetch(targetUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        }
      });
      if (res.ok) {
        const text = await res.text();
        return new NextResponse(text, {
          status: 200,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "public, max-age=3600"
          }
        });
      }
    } catch (err) {
      console.warn("External fetch failed for HTML targetUrl:", targetUrl, err);
    }
  }

  // Find book metadata or set defaults
  let title = "Bank PO & Clean Architecture Guide";
  let category = "Banking";
  let tags = ["programming", "architecture", "agile", "java"];

  if (bookId) {
    const matched = INITIAL_BOOKS.find(b => b.id === bookId || b.slug === bookId);
    if (matched) {
      title = matched.title;
      category = matched.category;
      tags = matched.tags || tags;
    }
  }

  // Generate robust HTML e-book with <h1> headings for TOC parsing
  const htmlDoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} - ExamKart Reflowable HTML E-Book</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.7;
      color: inherit;
      background: transparent;
      margin: 0;
      padding: 0;
    }
    .ebook-container {
      max-width: 820px;
      margin: 0 auto;
      padding: 2rem 1.5rem 4rem 1.5rem;
    }
    .ebook-header {
      border-bottom: 2px solid rgba(255, 255, 255, 0.15);
      padding-bottom: 2rem;
      margin-bottom: 2.5rem;
    }
    .category-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      background-color: #1976D2;
      color: #ffffff;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.75rem;
    }
    h1 {
      font-size: 1.875rem;
      font-weight: 800;
      line-height: 1.25;
      margin-top: 3rem;
      margin-bottom: 1.25rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid rgba(150, 150, 150, 0.25);
      scroll-margin-top: 80px;
    }
    h2 {
      font-size: 1.35rem;
      font-weight: 700;
      margin-top: 2rem;
      margin-bottom: 0.75rem;
    }
    p {
      margin-bottom: 1.25rem;
      font-size: 1em;
    }
    .callout-box {
      background: rgba(25, 118, 210, 0.08);
      border-left: 4px solid #1976D2;
      border-radius: 8px;
      padding: 1.25rem;
      margin: 1.5rem 0;
    }
    .code-block {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      background: rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(150, 150, 150, 0.2);
      border-radius: 8px;
      padding: 1rem;
      overflow-x: auto;
      font-size: 0.9em;
      margin: 1.5rem 0;
      line-height: 1.5;
    }
    .sample-notice {
      background: rgba(245, 158, 11, 0.12);
      border: 1px dashed #f59e0b;
      border-radius: 12px;
      padding: 1.5rem;
      margin: 3rem 0;
      text-align: center;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5rem 0;
    }
    th, td {
      border: 1px solid rgba(150, 150, 150, 0.25);
      padding: 0.75rem 1rem;
      text-align: left;
    }
    th {
      background: rgba(25, 118, 210, 0.12);
      font-weight: 700;
    }
  </style>
</head>
<body>
  <div class="ebook-container">
    <div class="ebook-header">
      <span class="category-badge">${category}</span>
      <h1 style="margin-top:0; border-bottom:none; font-size:2.25rem;">${title}</h1>
      <p style="opacity: 0.85; font-size: 1.05rem;">
        Official Reflowable Digital E-Book • ExamKart Interactive E-Reader Edition
      </p>
      <div style="font-size: 0.85rem; opacity: 0.75; display: flex; gap: 0.5rem; flex-wrap: wrap;">
        ${tags.map(t => `<span style="border: 1px solid currentColor; padding: 2px 8px; border-radius: 4px;">#${t}</span>`).join(" ")}
      </div>
    </div>

    <h1 id="chapter-1">Chapter 1: Clean Code Fundamentals & SOLID Principles</h1>
    <p>
      Writing clean code is vital for modern software engineering and IT Officer competitive exams. Clean code is code that is easy to read, easy to understand, and easy to maintain.
    </p>
    <div class="callout-box">
      <strong>Core Exam Rule:</strong> High cohesion and low coupling are the two main pillars of extensible system architecture. Single Responsibility Principle (SRP) states that a class should have one, and only one, reason to change.
    </div>
    <p>
      The SOLID acronym represents five key design principles:
    </p>
    <ul>
      <li><strong>S - Single Responsibility Principle:</strong> A class should have only one job.</li>
      <li><strong>O - Open/Closed Principle:</strong> Software entities should be open for extension, but closed for modification.</li>
      <li><strong>L - Liskov Substitution Principle:</strong> Subtypes must be substitutable for their base types.</li>
      <li><strong>I - Interface Segregation Principle:</strong> Clients should not be forced to depend on methods they do not use.</li>
      <li><strong>D - Dependency Inversion Principle:</strong> Depend upon abstractions, not concretions.</li>
    </ul>

    <h1 id="chapter-2">Chapter 2: Data Structures & High-Performance Algorithms</h1>
    <p>
      Data structures form the memory organization layer of software applications. Bank PO exams assess time complexity analysis using Big-O notation.
    </p>
    <table>
      <thead>
        <tr>
          <th>Data Structure</th>
          <th>Access Complexity</th>
          <th>Search Complexity</th>
          <th>Insertion Complexity</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Array / ArrayList</td>
          <td>O(1)</td>
          <td>O(n)</td>
          <td>O(n)</td>
        </tr>
        <tr>
          <td>Binary Search Tree</td>
          <td>O(log n)</td>
          <td>O(log n)</td>
          <td>O(log n)</td>
        </tr>
        <tr>
          <td>Hash Table</td>
          <td>N/A</td>
          <td>O(1) Avg</td>
          <td>O(1) Avg</td>
        </tr>
      </tbody>
    </table>

    <h1 id="chapter-3">Chapter 3: Object-Oriented Programming & Java Design Patterns</h1>
    <p>
      Design patterns represent time-tested solutions to common software design problems. In modern Java runtime applications, creational, structural, and behavioral patterns streamline execution.
    </p>
    <div class="code-block">
// Example Singleton Pattern Implementation in Java
public class DatabaseConnectionPool {
    private static volatile DatabaseConnectionPool instance;

    private DatabaseConnectionPool() {
        // Initialize pool connection
    }

    public static DatabaseConnectionPool getInstance() {
        if (instance == null) {
            synchronized (DatabaseConnectionPool.class) {
                if (instance == null) {
                    instance = new DatabaseConnectionPool();
                }
            }
        }
        return instance;
    }
}
    </div>

    ${isSample ? `
    <div class="sample-notice">
      <h3 style="margin-top:0; color:#d97706;">🔒 Free Sample Chapter Preview Complete</h3>
      <p style="font-size:0.9rem; margin-bottom:1rem;">
        You have reached the end of the free sample chapters. Unlock full lifetime access to read Chapter 4 (Database Indexing), Chapter 5 (Microservices & System Design), and Chapter 6 (PYQs & Mock Drills).
      </p>
    </div>
    ` : `
    <h1 id="chapter-4">Chapter 4: Database Indexing & Query Optimization</h1>
    <p>
      Database performance optimization is a frequent topic in Banking IT Specialist exams. B-Tree and Hash indexes dramatically speed up SELECT query execution times by reducing disk I/O operations.
    </p>
    <div class="callout-box">
      <strong>Indexing Tip:</strong> Avoid over-indexing columns that undergo frequent UPDATE or INSERT operations, as index rebuilding introduces write latency overheads.
    </div>

    <h1 id="chapter-5">Chapter 5: Microservices Architecture & Agile Principles</h1>
    <p>
      Modern enterprise banking software relies on decoupled microservices communicating via RESTful APIs and asynchronous message brokers like Apache Kafka. Agile methodology emphasizes iterative delivery and sprint backlog velocity.
    </p>

    <h1 id="chapter-6">Chapter 6: Practice MCQs & Solved Exam Drills</h1>
    <p>
      Test your knowledge with these high-frequency practice questions:
    </p>
    <ol>
      <li>
        <strong>Q: Which SOLID principle is violated if a class handles both user authentication and DB logging?</strong><br/>
        <em>Answer:</em> Single Responsibility Principle (SRP).
      </li>
      <li>
        <strong>Q: What is the worst-case time complexity of QuickSort?</strong><br/>
        <em>Answer:</em> O(n²) when the pivot chosen is consistently the smallest or largest element.
      </li>
    </ol>
    `}

  </div>
</body>
</html>`;

  return new NextResponse(htmlDoc, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600"
    }
  });
}
