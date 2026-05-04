// src/utils/promptTemplates.js

export const prompts = {
    generalExplanation: (filePath, code, question) => `
        Analyze the following code from the file "${filePath}".
        User's question: "${question || 'Provide a high-level explanation of what this code does.'}"

        **Formatting Rules (MUST follow):**
        - Use rich markdown formatting with clear section headers (## and ###)
        - Use emojis/symbols at the start of each section header to make it visually appealing (e.g. 📄, 🔍, ⚙️, 🧩, 📌, 💡, 🚀, ✅, ⚠️, 🔗, 📦, 🛠️, 🎯, 📊, 🏗️)
        - Use bullet points and numbered lists for clarity
        - Use **bold** for key terms and \`inline code\` for code references
        - Use code blocks with language highlighting for code examples
        - Add a brief TL;DR summary at the top with a 🎯 emoji
        - Use horizontal rules (---) to separate major sections
        - Keep it well-structured, visually scannable, and attractive

        Code:
        \`\`\`
        ${code}
        \`\`\`
    `,
    projectArchitecture: (fileTreeJSON) => `
        Generate a comprehensive Architecture Diagram (ARP) and Data Flow Diagram (DFT) for the entire project.
        Based on the provided file tree structure, infer the overall system architecture.

        **Formatting Rules (MUST follow):**
        - Start with a clear 🎯 **Architecture Overview** summarizing the project's purpose and structure based on its files.
        - Provide a Mermaid.js diagram wrapped in \\\`\\\`\\\`mermaid ... \\\`\\\`\\\` showing the high-level architecture, main modules, and data flow. Use flowchart TD or LR.
        - Add a section 📦 **Core Modules** explaining the inferred responsibilities of the main directories and files.
        - Ensure the output is well-structured and uses emojis for readability.

        File Tree:
        \`\`\`json
        ${fileTreeJSON}
        \`\`\`
    `,
    mindMap: (filePath, code) => `
        Generate a hierarchical JSON object representing the structure of the code below.
        The root node should be the file name with type "root".
        
        Each node MUST have:
        - "name" (string): a short descriptive label
        - "type" (string): one of these exact values: "root", "module", "class", "function", "method", "variable", "constant", "import", "export", "hook", "state", "effect", "component", "interface", "type", "property", "parameter"
        - "children" (array, optional): nested child nodes

        Rules:
        - Group imports under a single "Imports" node with type "module"
        - Group exports under a single "Exports" node with type "module"
        - For React components, identify hooks as type "hook", state variables as "state", effects as "effect"
        - For classes, list methods as type "method" and properties as type "property"
        - For functions, list parameters as type "parameter"
        - Keep names SHORT (max 30 chars), use the actual identifier names from code
        - Aim for 2-4 levels of depth for a clear visual hierarchy

        IMPORTANT: Respond with ONLY the raw JSON object, no surrounding text or markdown.

        File: ${filePath}
        Code:
        \`\`\`
        ${code}
        \`\`\`
    `,
    codeQuality: (filePath, code) => `
        Analyze the code in "${filePath}" for quality, bugs, and potential improvements.
        Your response MUST be a raw JSON array (starting with "[" and ending with "]") with no surrounding text, no markdown, and no wrapping object.
        Each element must be an object with exactly three keys: "line" (number or "N/A"), "issue" (string), "suggestion" (string).
        Example format: [{"line": 5, "issue": "Missing error handling", "suggestion": "Wrap in try/catch"}]

        Code:
        \`\`\`
        ${code}
        \`\`\`
    `,
    autoComment: (code) => `
        Add helpful, concise inline comments to the following code.
        Return only the complete, updated code with the comments added. Do not add any explanation, just the raw code.

        Code:
        \`\`\`
        ${code}
        \`\`\`
    `,
    unitTests: (code, language) => {
        const framework = language === 'python' ? 'PyTest' : 'Jest/React Testing Library';
        return `
            Generate unit tests for the following code using the ${framework} framework.
            Provide only the test code in a single code block. Do not add any explanations or surrounding text.

            Code:
            \`\`\`
            ${code}
            \`\`\`
        `;
    },
    snippetExplanation: (snippet) => `
        Explain the following code snippet concisely. Focus on its purpose and functionality.

        **Formatting Rules (MUST follow):**
        - Start with a one-line 🎯 **TL;DR** summary
        - Use **bold** for key terms and \`inline code\` for code references
        - Use bullet points for clarity
        - Use emojis to make section headers visually appealing (e.g. ⚙️, 📌, 💡)
        - Keep it concise but well-structured and scannable

        Snippet:
        \`\`\`
        ${snippet}
        \`\`\`
    `,

    // Documentation Generator Templates
    docs: {
        readme: (filePath, code) => `
            Generate a professional, comprehensive README.md for the following code file "${filePath}".

            Include these sections with proper markdown formatting:
            1. **Title & Badges** — Project name with relevant shields.io badge placeholders (build, version, license)
            2. **📋 Overview** — Clear 2-3 sentence description of what this code does
            3. **✨ Features** — Bullet list of key features/capabilities
            4. **🚀 Quick Start** — Installation and basic setup steps with code blocks
            5. **📖 Usage** — Practical code examples showing how to use the module
            6. **⚙️ API Reference** — Table of exported functions/components with params, types, and returns
            7. **🔧 Configuration** — Any configurable options or environment variables
            8. **📁 Project Structure** — Brief file/folder overview if applicable
            9. **🤝 Contributing** — Brief contribution guidelines
            10. **📄 License** — License placeholder

            Use rich markdown: tables, code blocks with language tags, blockquotes, emojis in headers.
            Make it look professional and production-ready.

            Code:
            \`\`\`
            ${code}
            \`\`\`
        `,
        api: (filePath, code) => `
            Generate detailed API documentation for the code in "${filePath}".

            For EVERY exported function, class, method, and component:
            - **Function signature** with full type annotations
            - **Description** — What it does, when to use it
            - **Parameters** — Table with: Name | Type | Required | Default | Description
            - **Returns** — Type and description
            - **Throws** — Any errors it may throw
            - **Example** — Working code example
            - **Notes/Warnings** — Edge cases, performance considerations

            Format with:
            - ## for each major export
            - ### for methods within classes
            - Tables for parameters
            - Code blocks for examples and signatures
            - ⚠️ callouts for important notes
            - Use emojis in section headers

            Code:
            \`\`\`
            ${code}
            \`\`\`
        `,
        jsdoc: (filePath, code) => `
            Add comprehensive JSDoc/docstring comments to EVERY function, class, method, variable, and type in the following code from "${filePath}".

            Rules:
            - Use JSDoc format (/** ... */) for JavaScript/TypeScript
            - Use docstrings (""" ... """) for Python
            - Include: @param, @returns, @throws, @example, @since, @deprecated (if applicable)
            - Add @typedef for complex objects
            - Add file-level documentation at the top with @file, @module, @author
            - Add inline comments for complex logic blocks
            - Keep descriptions clear and concise

            Return ONLY the complete updated code with all comments added. No explanations.

            Code:
            \`\`\`
            ${code}
            \`\`\`
        `,
        usage: (filePath, code) => `
            Generate comprehensive, real-world usage examples for the code in "${filePath}".

            Include:
            1. **🏁 Basic Usage** — Simplest possible example to get started
            2. **📦 Import/Setup** — All import variations and setup patterns
            3. **💡 Common Patterns** — 3-5 practical real-world use cases with full code
            4. **🔧 Advanced Usage** — Complex scenarios, composition, edge cases
            5. **⚡ With Other Libraries** — Integration examples with popular libraries/frameworks
            6. **❌ Common Mistakes** — Anti-patterns with corrections
            7. **🎯 Best Practices** — Tips for optimal usage

            Each example must:
            - Be a complete, runnable code block with language tag
            - Have a descriptive title and brief explanation
            - Include expected output as comments where helpful

            Use rich markdown formatting with emojis in headers.

            Code:
            \`\`\`
            ${code}
            \`\`\`
        `,
        changelog: (filePath, code) => `
            Analyze the code in "${filePath}" and generate a realistic CHANGELOG.md based on the code's structure, patterns, and complexity.

            Format as a professional changelog following Keep a Changelog convention:

            # Changelog

            ## [1.0.0] - Current Release
            ### ✨ Added
            ### 🔄 Changed
            ### 🐛 Fixed
            ### 🗑️ Deprecated
            ### 💥 Breaking Changes

            ## [0.x.x] - Previous versions (infer from code patterns)

            Rules:
            - Infer version history from code patterns, TODO comments, refactoring patterns
            - Be realistic and specific about what each version added
            - Include semver-style version numbers
            - Group changes by type (Added, Changed, Fixed, etc.)
            - Use emojis for each change type
            - Reference specific functions/features from the code

            Code:
            \`\`\`
            ${code}
            \`\`\`
        `,
        architecture: (filePath, code) => `
            Generate a comprehensive Architecture Documentation for the code in "${filePath}".

            Include:
            1. **🏗️ Architecture Overview** — High-level description of the system design
            2. **📐 Design Patterns** — Identify and explain patterns used (MVC, Observer, Factory, etc.)
            3. **🧩 Component Breakdown** — Each major component/module with its responsibility
            4. **🔗 Data Flow** — How data moves through the system (describe as a flow)
            5. **📊 Dependency Map** — What depends on what, external vs internal dependencies
            6. **🔐 State Management** — How state is handled, stored, and updated
            7. **⚡ Performance Considerations** — Caching, optimization, lazy loading patterns
            8. **📈 Scalability Notes** — How the architecture supports growth
            9. **🛡️ Error Handling Strategy** — How errors propagate and are handled
            10. **🔮 Technical Debt & Improvements** — Areas that could be improved

            Use:
            - Mermaid diagram syntax for flowcharts where helpful (wrapped in \`\`\`mermaid blocks)
            - Tables for dependency maps and component breakdowns
            - Code blocks for key code references
            - Emojis in all section headers

            Code:
            \`\`\`
            ${code}
            \`\`\`
        `,
    },

    // Debug Assistant Templates
    debug: {
        error: (code, errorMsg) => `
            You are a senior debugging expert. Analyze the following error/stack trace in the context of the code provided.

            **Error/Stack Trace:**
            \`\`\`
            ${errorMsg}
            \`\`\`

            **Code:**
            \`\`\`
            ${code}
            \`\`\`

            Provide your analysis in this EXACT structure with rich markdown:

            ## 🔴 Error Summary
            One clear sentence explaining what the error means in plain English.

            ## 🔍 Root Cause Analysis
            - Explain exactly WHY this error occurs
            - Point to the specific line(s) and variable(s) causing it
            - Explain the chain of events leading to the error

            ## 🛠️ Step-by-Step Fix
            Numbered steps with code snippets showing exactly what to change.

            ## ✅ Fixed Code
            Show the corrected code in a complete code block with the fix applied.

            ## 🛡️ Prevention Tips
            - How to prevent this error in the future
            - Related best practices
            - Useful ESLint rules or TypeScript settings if applicable

            ## 🔗 Related Issues
            List 2-3 other common bugs that often accompany this type of error.
        `,
        bug: (code, description) => `
            You are a senior debugging expert. The developer reports unexpected behavior in the following code.

            **Bug Description:**
            ${description}

            **Code:**
            \`\`\`
            ${code}
            \`\`\`

            Provide your analysis in this EXACT structure:

            ## 🐛 Bug Diagnosis
            Clear explanation of what's happening vs what should happen.

            ## 🔍 Root Cause
            - Identify the EXACT part of the code causing the bug
            - Explain the faulty logic step by step
            - Show the execution flow that leads to the unexpected behavior

            ## 🛠️ Fix
            Show before and after code with clear explanations:
            ### Before (Buggy):
            \`\`\`
            [buggy code snippet]
            \`\`\`
            ### After (Fixed):
            \`\`\`
            [fixed code snippet]
            \`\`\`

            ## 🧪 How to Test the Fix
            Specific test cases to verify the bug is resolved.

            ## 💡 Why This Bug Is Common
            Brief explanation of why developers often make this mistake.
        `,
        performance: (code, description) => `
            You are a senior performance engineer. Analyze the following code for performance issues.

            **Performance Issue:**
            ${description}

            **Code:**
            \`\`\`
            ${code}
            \`\`\`

            Provide your analysis in this EXACT structure:

            ## 🐌 Performance Diagnosis
            Summary of the performance bottleneck found.

            ## 📊 Bottleneck Analysis
            For each issue found:
            - **Issue**: What's slow and where
            - **Impact**: Severity (🔴 Critical / 🟡 Moderate / 🟢 Minor)
            - **Complexity**: O(n) analysis where applicable
            - **Line(s)**: Specific code reference

            ## ⚡ Optimizations
            For each optimization, show before/after:
            ### Optimization 1: [Name]
            **Before:**
            \`\`\`
            [slow code]
            \`\`\`
            **After:**
            \`\`\`
            [optimized code]
            \`\`\`
            **Why**: Explanation of the improvement

            ## 📈 Expected Impact
            Estimated improvement for each optimization.

            ## 🛡️ React-Specific Tips
            If React code: useMemo, useCallback, React.memo, virtualization, lazy loading suggestions.
        `,
        logic: (code, description) => `
            You are a senior debugging expert. The code runs without errors but produces incorrect results.

            **Expected vs Actual Behavior:**
            ${description}

            **Code:**
            \`\`\`
            ${code}
            \`\`\`

            Provide your analysis in this EXACT structure:

            ## 🧩 Logic Error Found
            One sentence explaining what the logic error is.

            ## 🔎 Trace Walkthrough
            Walk through the code execution step by step with actual values:
            | Step | Line | Variable | Value | Expected |
            |------|------|----------|-------|----------|
            | 1    | ...  | ...      | ...   | ...      |

            ## 🐛 The Bug
            Point to the exact line where logic diverges from expected behavior.
            Explain WHY the current logic is wrong.

            ## ✅ Corrected Logic
            Show the fixed code with inline comments explaining each change.

            ## 🧪 Verification
            Show test inputs and expected outputs to verify the fix:
            | Input | Expected Output | Result |
            |-------|----------------|--------|
            | ...   | ...            | ✅     |
        `,
        async: (code, description) => `
            You are a senior expert in async JavaScript, Promises, and React state.

            **Async Issue:**
            ${description}

            **Code:**
            \`\`\`
            ${code}
            \`\`\`

            Provide your analysis in this EXACT structure:

            ## ⏱️ Async Issue Diagnosis
            Explanation of the timing/async problem.

            ## 🔀 Execution Timeline
            Show the actual execution order vs expected:
            ### ❌ Actual Order:
            1. [step with timing]
            2. [step with timing]

            ### ✅ Expected Order:
            1. [step with timing]
            2. [step with timing]

            ## 🔍 Root Cause
            - Identify: race condition / stale closure / missing await / wrong dependency array / state batching issue
            - Explain the async mechanism that causes this

            ## 🛠️ Fix
            Show the corrected async code with detailed comments.

            ## 🛡️ Async Best Practices
            - Cleanup patterns (AbortController, teardown)
            - State update safety checks
            - Error boundaries for async operations
            - Useful patterns: debounce, throttle, useTransition
        `,
        type: (code, errorMsg) => `
            You are a TypeScript expert. Fix the following type error.

            **TypeScript Error:**
            \`\`\`
            ${errorMsg}
            \`\`\`

            **Code:**
            \`\`\`
            ${code}
            \`\`\`

            Provide your analysis in this EXACT structure:

            ## 🏷️ Type Error Explained
            Plain English explanation of what the type system is complaining about.

            ## 🔍 Why It Fails
            - Show the type mismatch visually
            - Explain what type is expected vs what is provided
            - Show the type chain if it's a nested type issue

            ## 🛠️ Possible Fixes (ranked by quality)
            ### Fix 1 (Recommended): [Name]
            \`\`\`typescript
            [fixed code]
            \`\`\`

            ### Fix 2 (Alternative): [Name]
            \`\`\`typescript
            [alternative fix]
            \`\`\`

            ### ❌ Avoid: Type assertion / any
            Explain why \`as\` and \`any\` are usually the wrong fix.

            ## 📚 Type System Insight
            Brief explanation of the TypeScript concept behind this error (generics, union types, type narrowing, etc.)
        `,
    },

    // Code Diff Viewer
    diff: (originalCode, newCode) => `
        You are a senior code reviewer. Analyze the differences between the 'Original Code' and 'Modified Code'.

        **Original Code:**
        \`\`\`
        ${originalCode}
        \`\`\`

        **Modified Code:**
        \`\`\`
        ${newCode}
        \`\`\`

        Provide your review in this EXACT structure:

        ## 🔀 Summary of Changes
        A 2-3 sentence high-level summary of what was actually changed.

        ## 🧠 Why It Changed (The "Why")
        Explain the reasoning behind these changes (e.g., performance, bug fix, refactor, new feature).

        ## 📝 Detailed Walkthrough
        Bullet points explaining the specific lines or blocks of code that were altered and what effect they have.

        ## 👁️ Visual Diff
        Render a standard markdown diff block using \`\`\`diff format.
        Prefix removed lines with a single \`-\`
        Prefix added lines with a single \`+\`
        Leave unchanged context lines without a prefix (just a space).

        \`\`\`diff
        [Your diff goes here]
        \`\`\`

        ## ⚠️ Potential Side Effects
        If applicable, mention any edge cases or regressions this change might introduce.
    `,
};