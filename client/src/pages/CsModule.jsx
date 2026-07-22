import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GlassCard from '../components/GlassCard';
import { motion } from 'framer-motion';
import { 
  FiCpu, 
  FiCheckCircle, 
  FiBookmark, 
  FiEdit3, 
  FiHelpCircle, 
  FiClock, 
  FiZap, 
  FiCode, 
  FiLayers, 
  FiFileText,
  FiBookOpen
} from 'react-icons/fi';

const FALLBACK_CS_TOPICS = [
  {
    id: "cs_1",
    subject: "Object-Oriented Programming",
    topicName: "Encapsulation & Abstraction",
    difficulty: "Beginner",
    readingTime: "5 mins",
    definition: "Encapsulation bundles data and methods operating on that data within a single unit, hiding internal state from direct external modification.",
    whyImportant: "Prevents unintended side effects and ensures data integrity across complex enterprise codebases.",
    analogy: "Think of an ATM: you press buttons to withdraw money (Interface/Abstraction) without touching internal cash vaults or hardware (Encapsulation).",
    detailedExplanation: "Encapsulation is achieved using private/protected access modifiers and getter/setter functions. Abstraction hides background complexity while showing essential features.",
    visualization: "Class Car { private Engine engine; public void start() { engine.ignite(); } }",
    codeExample: "class BankAccount {\n  private balance = 0;\n  public deposit(amount) { if (amount > 0) this.balance += amount; }\n  public getBalance() { return this.balance; }\n}",
    interviewTips: "Always emphasize how encapsulation protects class invariants and simplifies unit testing.",
    commonInterviewQuestions: ["What is the difference between Abstraction and Encapsulation?"],
    commonMistakes: "Exposing internal mutable state directly through public getters.",
    memoryTricks: "Encapsulation = Protect Data. Abstraction = Simplify Interface.",
    oneMinuteNotes: "Encapsulation = Data Hiding. Abstraction = Detail Hiding.",
    quiz: {
      question: "Which OOP concept is achieved by hiding class data members behind private access modifiers?",
      options: ["Encapsulation", "Polymorphism", "Inheritance", "Compilation"],
      correctIndex: 0,
      explanation: "Encapsulation restricts direct access to an object's components."
    }
  },
  {
    id: "cs_2",
    subject: "Database Management System",
    topicName: "Relational DB vs NoSQL",
    difficulty: "Beginner",
    readingTime: "6 mins",
    definition: "Relational databases store structured data in tables with strict schemas (ACID), while NoSQL databases store unstructured/semi-structured data with flexible schemas (BASE).",
    whyImportant: "Selecting the correct database model determines system scalability, transactional safety, and query speeds.",
    analogy: "Relational DB is like an organized spreadsheet with fixed columns. NoSQL is like a folder filled with JSON document files.",
    detailedExplanation: "SQL databases (PostgreSQL, MySQL) excel at complex multi-table joins and ACID transactions. NoSQL (MongoDB, DynamoDB) excels at horizontal scaling and rapid document iterations.",
    visualization: "SQL: Table Users(id, name) | NoSQL: Collection Users [{ _id: 1, name: 'Alice', tags: ['dev'] }]",
    codeExample: "// MongoDB Query\ndb.users.find({ age: { $gte: 21 } });\n\n-- SQL Query\nSELECT * FROM users WHERE age >= 21;",
    interviewTips: "Frame your answer around CAP theorem trade-offs: Consistency vs Availability vs Partition tolerance.",
    commonInterviewQuestions: ["When would you choose MongoDB over PostgreSQL for a new project?"],
    commonMistakes: "Assuming NoSQL databases cannot support transactions; modern MongoDB supports ACID transactions.",
    memoryTricks: "SQL = Tables & Structure. NoSQL = Documents & Flexibility.",
    oneMinuteNotes: "SQL = Fixed Schema, ACID. NoSQL = Dynamic Schema, BASE.",
    quiz: {
      question: "Which database type is best suited for handling dynamic, unstructured JSON document storage at scale?",
      options: ["NoSQL (Document DB)", "Relational (SQL)", "Flat Text File", "Graph Database"],
      correctIndex: 0,
      explanation: "NoSQL document databases naturally store and index dynamic JSON objects."
    }
  },
  {
    id: "cs_3",
    subject: "Operating System",
    topicName: "Process vs Thread & Scheduling",
    difficulty: "Intermediate",
    readingTime: "5 mins",
    definition: "A Process is an independent program execution context with isolated memory. A Thread is a lightweight execution path within a process that shares memory with sibling threads.",
    whyImportant: "Understanding concurrency allows software engineers to build high-performance multi-threaded applications without race conditions.",
    analogy: "A Process is a separate factory building. Threads are multiple workers inside the same building sharing tools.",
    detailedExplanation: "Context switching between processes is CPU-heavy due to virtual memory remapping. Thread context switching is fast because threads share the same address space.",
    visualization: "Process [ Address Space | Heap | Thread 1 (Stack), Thread 2 (Stack) ]",
    codeExample: "// Java Multi-threading\nThread t = new Thread(() -> System.out.println(\"Executing concurrent thread task\"));\nt.start();",
    interviewTips: "Mention CPU scheduling algorithms: Round Robin, SJF, and Priority Scheduling.",
    commonInterviewQuestions: ["Why is context switching between processes slower than between threads?"],
    commonMistakes: "Confusing shared heap memory between threads with thread-local stack memory.",
    memoryTricks: "Process = Isolated Memory. Thread = Shared Memory.",
    oneMinuteNotes: "Process = Heavyweight. Thread = Lightweight inside Process.",
    quiz: {
      question: "What is shared among multiple threads belonging to the same process?",
      options: ["Heap Memory & File Handles", "Execution Stack", "Program Counter", "CPU Registers"],
      correctIndex: 0,
      explanation: "Threads within the same process share heap memory, global variables, and open file descriptors."
    }
  },
  {
    id: "cs_4",
    subject: "Computer Networks",
    topicName: "OSI Model vs TCP/IP Stack",
    difficulty: "Beginner",
    readingTime: "6 mins",
    definition: "The OSI model is a 7-layer theoretical conceptual network architecture, while the TCP/IP model is a 4-layer practical protocol suite powering the Internet.",
    whyImportant: "Provides a structured framework for diagnosing network latency, packet loss, and security vulnerabilities.",
    analogy: "OSI is the blueprint architectural design of a building. TCP/IP is the actual physical building constructed.",
    detailedExplanation: "7 OSI Layers: Application, Presentation, Session, Transport, Network, Data Link, Physical. 4 TCP/IP Layers: Application, Transport, Internet, Network Access.",
    visualization: "HTTP (App) -> TCP (Transport) -> IP (Network) -> Ethernet (Data Link/Physical)",
    codeExample: "// HTTP Request Header\nGET /api/v1/resource HTTP/1.1\nHost: api.example.com\nUser-Agent: Mozilla/5.0",
    interviewTips: "Remember the OSI mnemonic: 'Please Do Not Throw Sausage Pizza Away'.",
    commonInterviewQuestions: ["On which layer do Routers vs Switches operate?"],
    commonMistakes: "Placing HTTP on the Transport layer; HTTP is an Application layer protocol.",
    memoryTricks: "OSI = 7 Theoretical Layers. TCP/IP = 4 Real Internet Layers.",
    oneMinuteNotes: "Routers = Layer 3 (Network IP). Switches = Layer 2 (Data Link MAC).",
    quiz: {
      question: "Which layer of the OSI model is responsible for end-to-end reliable transmission (TCP)?",
      options: ["Transport Layer (Layer 4)", "Network Layer (Layer 3)", "Application Layer (Layer 7)", "Data Link Layer (Layer 2)"],
      correctIndex: 0,
      explanation: "The Transport Layer (Layer 4) handles TCP segmentation, port numbering, and error recovery."
    }
  },
  {
    id: "cs_5",
    subject: "JavaScript",
    topicName: "Closures & Event Loop",
    difficulty: "Intermediate",
    readingTime: "6 mins",
    definition: "A Closure is a function bundled with references to its surrounding lexical state. The Event Loop enables non-blocking asynchronous JavaScript single-threaded execution.",
    whyImportant: "Closures enable data privacy and factory functions. The Event Loop explains how JS handles async I/O without freezing the browser.",
    analogy: "Event Loop is like a chef taking order slips from a queue, passing long tasks to the oven (Web API), and serving completed dishes.",
    detailedExplanation: "JavaScript executes synchronous code first on the Call Stack. Microtasks (Promises) run before Macrotasks (setTimeout, setInterval).",
    visualization: "Call Stack -> Web APIs -> Microtask Queue (Promises) -> Callback Queue (Timer)",
    codeExample: "function outer() {\n  let count = 0;\n  return () => ++count;\n}\nconst counter = outer();\nconsole.log(counter()); // 1",
    interviewTips: "Always explain lexical scoping when describing closures.",
    commonInterviewQuestions: ["What is the output order of console.log inside setTimeout vs Promise.resolve()?"],
    commonMistakes: "Thinking setTimeout(fn, 0) runs immediately; it must wait for the Call Stack to clear.",
    memoryTricks: "Closure = Function + Lexical Scope. Event Loop = Stack + Queues.",
    oneMinuteNotes: "Microtasks (Promises) > Macrotasks (Timers).",
    quiz: {
      question: "Which task queue has higher execution priority in the JavaScript Event Loop?",
      options: ["Microtask Queue (Promises)", "Macrotask Queue (setTimeout)", "Render Queue", "Idle Callback Queue"],
      correctIndex: 0,
      explanation: "Promises and queueMicrotask enter the Microtask Queue, which executes before any Macrotask."
    }
  },
  {
    id: "cs_6",
    subject: "React",
    topicName: "Virtual DOM & State Hooks",
    difficulty: "Intermediate",
    readingTime: "5 mins",
    definition: "The Virtual DOM is a lightweight in-memory representation of the real DOM. React diffs changes using the Reconciliation algorithm and updates only changed DOM nodes.",
    whyImportant: "Direct DOM manipulation is slow. Virtual DOM diffing minimizes real DOM writes, keeping complex web apps fast.",
    analogy: "Virtual DOM is like drafting architectural revisions on paper before knocking down real physical walls.",
    detailedExplanation: "useState manages component-local state. useEffect handles side-effects (fetching, subscriptions). Custom hooks encapsulate reusable stateful logic.",
    visualization: "State Change -> New Virtual DOM Tree -> Diff Algorithm (Reconciliation) -> Minimal Batch Real DOM Update",
    codeExample: "const [count, setCount] = useState(0);\nuseEffect(() => {\n  document.title = `Count: ${count}`;\n}, [count]);",
    interviewTips: "Explain how React keys help reconciliation diff lists efficiently.",
    commonInterviewQuestions: ["Why should you never mutate React state directly?"],
    commonMistakes: "Omitting dependencies in useEffect dependency arrays, causing stale closures.",
    memoryTricks: "Virtual DOM = In-memory copy. Reconciliation = Diffing algorithm.",
    oneMinuteNotes: "React diffs Virtual DOM trees to minimize expensive real DOM updates.",
    quiz: {
      question: "What algorithm does React use to compare Virtual DOM trees and calculate minimal updates?",
      options: ["Reconciliation (Diffing Algorithm)", "Dijkstra Algorithm", "Binary Search", "Depth First Search"],
      correctIndex: 0,
      explanation: "React's Reconciliation algorithm compares old and new Virtual DOM trees to batch DOM updates."
    }
  },
  {
    id: "cs_7",
    subject: "Node.js & Express",
    topicName: "Event-Driven Non-Blocking I/O",
    difficulty: "Intermediate",
    readingTime: "5 mins",
    definition: "Node.js uses an event-driven, single-threaded non-blocking I/O model powered by the V8 JavaScript engine and libuv library.",
    whyImportant: "Allows a single Node.js server to handle tens of thousands of concurrent connections efficiently with minimal RAM overhead.",
    analogy: "A single waiter taking orders from 50 tables, sending tickets to the kitchen, and serving food as orders finish.",
    detailedExplanation: "Libuv provides an event loop and a thread pool (default 4 threads) for handling heavy asynchronous I/O like file system reads and database calls.",
    visualization: "Client Request -> Event Loop -> Libuv Thread Pool (Async File/DB) -> Event Callback",
    codeExample: "import express from 'express';\nconst app = express();\napp.get('/api/data', (req, res) => res.json({ status: 'ok' }));",
    interviewTips: "Explain Middleware functions as a chain of (req, res, next) processing stages.",
    commonInterviewQuestions: ["What happens if CPU-heavy synchronous code blocks the Event Loop in Node.js?"],
    commonMistakes: "Executing heavy synchronous CPU loops inside HTTP request handlers, blocking all other incoming requests.",
    memoryTricks: "Node.js = Single Thread + Non-Blocking I/O + Libuv.",
    oneMinuteNotes: "Delegate CPU-heavy tasks to worker threads; use async I/O for network and DB.",
    quiz: {
      question: "Which C++ library provides the asynchronous event loop and thread pool in Node.js?",
      options: ["libuv", "V8 Engine", "Express", "npm"],
      correctIndex: 0,
      explanation: "libuv is the multi-platform C library that powers Node.js asynchronous non-blocking I/O."
    }
  },
  {
    id: "cs_8",
    subject: "MongoDB",
    topicName: "Document Data Modeling & Indexing",
    difficulty: "Intermediate",
    readingTime: "5 mins",
    definition: "MongoDB stores data in flexible BSON document collections. Indexing creates data structures (B-Trees) to optimize query speed from O(N) down to O(log N).",
    whyImportant: "Proper document modeling and single/compound indexing are critical for high-throughput production MongoDB databases.",
    analogy: "An Index is like the index section at the back of a textbook—find exact page numbers without scanning every page.",
    detailedExplanation: "Document design chooses between Embedding (denormalization for 1-to-few) and Referencing (normalization for 1-to-many/many-to-many).",
    visualization: "Collection: users [{ _id: ObjectId, name: String }]\nIndex: { email: 1 } -> B-Tree Lookup",
    codeExample: "// Create Compound Index\ndb.users.createIndex({ status: 1, createdAt: -1 });",
    interviewTips: "Explain ESR Rule for compound indexes: Equality, Sort, Range.",
    commonInterviewQuestions: ["When should you Embed vs Reference documents in MongoDB?"],
    commonMistakes: "Creating too many unneeded indexes, which slows down write operations.",
    memoryTricks: "Index = B-Tree for fast O(log N) lookup.",
    oneMinuteNotes: "Embed for 1-to-few reads; Reference for large growing collections.",
    quiz: {
      question: "What internal data structure does MongoDB use to maintain indexes for rapid query performance?",
      options: ["B-Tree", "Linked List", "Stack", "Queue"],
      correctIndex: 0,
      explanation: "MongoDB uses B-Trees to index fields, enabling fast O(log N) search queries."
    }
  },
  {
    id: "cs_9",
    subject: "Git & GitHub",
    topicName: "Branching, Merging & Rebase",
    difficulty: "Beginner",
    readingTime: "4 mins",
    definition: "Git is a distributed version control system. Merging joins feature branches by combining histories. Rebase rewrites commit history onto a new base commit.",
    whyImportant: "Mastery of Git workflow guarantees clean collaboration, conflict resolution, and reliable code deployments.",
    analogy: "Merging is joining two streams of history with a merge commit. Rebasing is re-attaching your branch at the tip of main.",
    detailedExplanation: "git merge creates a commit with two parent commits. git rebase moves commits one by one, creating a clean linear project history.",
    visualization: "Merge: A---B---C (main)\n         \\ / (merge commit)\n          D (feature)\nRebase: A---B---C---D' (linear main)",
    codeExample: "# Rebase feature branch onto main\ngit checkout feature\ngit rebase main",
    interviewTips: "Never rebase public shared branches; only rebase local un-pushed feature branches.",
    commonInterviewQuestions: ["What is the difference between git merge and git rebase?"],
    commonMistakes: "Force pushing (`git push -f`) to main branch without team alignment.",
    memoryTricks: "Merge = Preserves history with merge commit. Rebase = Linear clean history.",
    oneMinuteNotes: "Rebase for local clean history; Merge for preserving branch context.",
    quiz: {
      question: "Which Git command rewrites branch commits onto the tip of another branch for a linear history?",
      options: ["git rebase", "git merge", "git fetch", "git checkout"],
      correctIndex: 0,
      explanation: "git rebase moves or applies commits on top of another base tip, creating a linear history."
    }
  },
  {
    id: "cs_10",
    subject: "DSA Concepts",
    topicName: "Time Complexity & Big O Analysis",
    difficulty: "Beginner",
    readingTime: "6 mins",
    definition: "Big O notation describes the upper bound worst-case execution time or memory space required by an algorithm as input size (N) grows.",
    whyImportant: "Enables developers to analyze and select optimal algorithms before writing code for large scale data.",
    analogy: "O(1) is pressing a light switch. O(N) is walking down a street turning on every streetlight one by one.",
    detailedExplanation: "Common complexities: O(1) Constant < O(log N) Logarithmic < O(N) Linear < O(N log N) Linearithmic < O(N²) Quadratic.",
    visualization: "O(1) Array Index | O(log N) Binary Search | O(N) Linear Loop | O(N log N) Merge Sort | O(N²) Nested Loop",
    codeExample: "// O(log N) Binary Search\nlet low = 0, high = arr.length - 1;\nwhile(low <= high) {\n  let mid = Math.floor((low + high) / 2);\n  if (arr[mid] === target) return mid;\n}",
    interviewTips: "Always analyze both Time Complexity and Auxiliary Space Complexity during coding interviews.",
    commonInterviewQuestions: ["What is the average and worst-case time complexity of QuickSort vs MergeSort?"],
    commonMistakes: "Ignoring auxiliary space complexity when comparing iterative vs recursive algorithms.",
    memoryTricks: "Big O = Worst-case growth rate.",
    oneMinuteNotes: "Binary Search = O(log N). Sorting = O(N log N). Nested Loops = O(N²).",
    quiz: {
      question: "What is the worst-case time complexity of Binary Search on a sorted array of size N?",
      options: ["O(log N)", "O(N)", "O(N²)", "O(1)"],
      correctIndex: 0,
      explanation: "Binary Search halves the search space in each iteration, yielding O(log N) logarithmic complexity."
    }
  }
];

export default function CsModule() {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('');
  const [userNote, setUserNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [quizSelectedOption, setQuizSelectedOption] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/cs/topics');
      if (res.data && res.data.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        applyTopicData(res.data.data);
      } else {
        applyTopicData(FALLBACK_CS_TOPICS);
      }
    } catch (err) {
      console.warn('Network notice, using resilient fallback 10 CS roadmap subjects:', err.message);
      applyTopicData(FALLBACK_CS_TOPICS);
    } finally {
      setLoading(false);
    }
  };

  const applyTopicData = (topicArray) => {
    setTopics(topicArray);
    if (topicArray.length > 0) {
      setSelectedTopic(topicArray[0]);
      setSelectedSubjectFilter(topicArray[0].subject);
      setUserNote(topicArray[0].note || '');
    }
  };

  const handleSubjectSelect = (sub) => {
    setSelectedSubjectFilter(sub);
    const found = topics.find(t => t.subject === sub);
    if (found) {
      setSelectedTopic(found);
      setUserNote(found.note || '');
      setQuizSelectedOption(null);
      setQuizSubmitted(false);
    }
  };

  const handleToggleComplete = async (topicId) => {
    try {
      await axios.post(`/api/cs/topic/${topicId}/toggle`);
      setTopics(prev => prev.map(t => t.id === topicId ? { ...t, completed: !t.completed } : t));
      if (selectedTopic && selectedTopic.id === topicId) {
        setSelectedTopic(prev => ({ ...prev, completed: !prev.completed }));
      }
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

  const handleSaveNote = async () => {
    if (!selectedTopic) return;
    setSavingNote(true);
    try {
      await axios.post('/api/cs/note', {
        topicId: selectedTopic.id,
        noteText: userNote
      });
      setTopics(prev => prev.map(t => t.id === selectedTopic.id ? { ...t, note: userNote } : t));
    } catch (err) {
      console.error('Save note error:', err);
    } finally {
      setSavingNote(false);
    }
  };

  const uniqueSubjects = Array.from(new Set(topics.map(t => t.subject)));

  if (loading) {
    return (
      <div className="space-y-6 min-h-[500px] flex flex-col justify-center items-center py-16">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-emerald-400 text-xl font-bold">
            <FiCpu />
          </div>
        </div>
        <div className="text-center space-y-2 max-w-md">
          <h3 className="text-xl font-bold text-white">AI Teacher Generating Core CS Roadmap Lessons...</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Fetching 10 sequential roadmap topics across OOP, DBMS, OS, Computer Networks, JS, React, Node.js, MongoDB, Git & DSA.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <FiCpu className="text-emerald-400" /> AI-Teacher Core CS Module
          </h1>
          <p className="text-slate-400 text-base mt-1">
            Dynamic sequential lessons generated daily from the Master Roadmap for all 10 core computer science subjects.
          </p>
        </div>
      </div>

      {/* Subject Filter Pills (All 10 Subjects Displayed Directly) */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-3 scrollbar-none">
        {uniqueSubjects.map((sub) => {
          const isSelected = selectedSubjectFilter === sub;
          const topicForSub = topics.find(t => t.subject === sub);
          const isDone = topicForSub?.completed;

          return (
            <button
              key={sub}
              onClick={() => handleSubjectSelect(sub)}
              className={`px-4 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25 scale-105'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700'
              }`}
            >
              <span>{sub}</span>
              {isDone && <FiCheckCircle className="text-xs text-slate-950 stroke-[3]" />}
            </button>
          );
        })}
      </div>

      {/* Main Lesson Content Area */}
      {selectedTopic && (
        <div className="space-y-8">
          <GlassCard hover={false} className="space-y-8">
            {/* Topic Header & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
              <div>
                <span className="px-3.5 py-1 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  {selectedTopic.subject}
                </span>
                <h2 className="text-3xl font-extrabold text-white mt-2 flex items-center gap-3">
                  {selectedTopic.topicName}
                </h2>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                  <span className="flex items-center gap-1"><FiClock /> Reading Time: {selectedTopic.readingTime}</span>
                  <span>•</span>
                  <span>Difficulty: <strong className="text-emerald-400">{selectedTopic.difficulty}</strong></span>
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => handleToggleComplete(selectedTopic.id)}
                  className={`px-5 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    selectedTopic.completed
                      ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30'
                      : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  <FiCheckCircle className="text-base" />
                  <span>{selectedTopic.completed ? 'Topic Completed' : 'Mark Topic Completed'}</span>
                </button>
              </div>
            </div>

            {/* Core Definition & Intuitive Analogy */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <FiZap /> 1-Sentence Placement Definition
                </h3>
                <p className="text-slate-200 text-base leading-relaxed font-semibold">{selectedTopic.definition}</p>
              </div>

              <div className="p-5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 space-y-2">
                <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                  <FiLayers /> Real-World Intuitive Analogy
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">{selectedTopic.analogy}</p>
              </div>
            </div>

            {/* Detailed Explanation */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <FiFileText className="text-emerald-400" /> Comprehensive Deep Explanation
              </h3>
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 text-base leading-relaxed whitespace-pre-line">
                {selectedTopic.detailedExplanation}
              </div>
            </div>

            {/* Code Syntax Example */}
            {selectedTopic.codeExample && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <FiCode className="text-emerald-400" /> Implementation Code Example
                </h3>
                <pre className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-sm overflow-x-auto leading-relaxed">
                  {selectedTopic.codeExample}
                </pre>
              </div>
            )}

            {/* Placement Interview Tips & Common Pitfalls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-purple-950/30 border border-purple-500/20 space-y-2">
                <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                  <FiBookOpen /> Technical Interview Advice
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">{selectedTopic.interviewTips}</p>
              </div>

              <div className="p-5 rounded-2xl bg-amber-950/30 border border-amber-500/20 space-y-2">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <FiHelpCircle /> Common Interview Questions
                </h3>
                <ul className="list-disc list-inside text-slate-300 text-sm space-y-1">
                  {selectedTopic.commonInterviewQuestions?.map((q, idx) => (
                    <li key={idx}>{q}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Interactive Concept Quiz */}
            {selectedTopic.quiz && (
              <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <FiZap /> Interactive Concept Verification Quiz
                </h3>
                <p className="text-base text-white font-semibold">{selectedTopic.quiz.question}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedTopic.quiz.options?.map((option, idx) => {
                    const isSelected = quizSelectedOption === idx;
                    const isCorrect = idx === selectedTopic.quiz.correctIndex;

                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setQuizSelectedOption(idx);
                          setQuizSubmitted(true);
                        }}
                        className={`p-3.5 rounded-xl border text-left text-sm font-medium transition-all cursor-pointer ${
                          quizSubmitted
                            ? isCorrect
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                              : isSelected
                              ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                              : 'bg-slate-900 border-slate-800 text-slate-400'
                            : isSelected
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-200'
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>

                {quizSubmitted && (
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-sm space-y-1">
                    <span className={`font-bold block ${quizSelectedOption === selectedTopic.quiz.correctIndex ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {quizSelectedOption === selectedTopic.quiz.correctIndex ? '✅ Correct Answer!' : '❌ Incorrect Answer'}
                    </span>
                    <p className="text-slate-300 text-xs leading-relaxed">{selectedTopic.quiz.explanation}</p>
                  </div>
                )}
              </div>
            )}

            {/* Candidate Personal Notes Section */}
            <div className="space-y-3 border-t border-slate-800 pt-6">
              <label className="block text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <FiEdit3 className="text-emerald-400" /> Personal Notes & Key Takeaways for {selectedTopic.topicName}:
              </label>
              <textarea
                rows={3}
                value={userNote}
                onChange={(e) => setUserNote(e.target.value)}
                placeholder="Write your custom notes, memory tricks, or formula summaries here..."
                className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleSaveNote}
                  disabled={savingNote}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  {savingNote ? 'Saving Note...' : 'Save Notes'}
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
