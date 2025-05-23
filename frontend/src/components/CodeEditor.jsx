import { useRef } from "react";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-python";
import "prismjs/themes/prism-dark.css";

const CodeEditor = ({ code, setCode }) => {
    const editorRef = useRef(null);

    // Auto-closing pairs
    const pairs = {
        "{": "}",
        "[": "]",
        '"': '"',
        "'": "'",
        "(": ")",
        "`": "`"
    };

    // Handle key presses for auto-closing
    const handleKeyDown = (e) => {
        const { key, target } = e;
        if (pairs[key]) {
            e.preventDefault();
            const start = target.selectionStart;
            const end = target.selectionEnd;
            const value = target.value;
            const before = value.substring(0, start);
            const after = value.substring(end);
            const closingChar = pairs[key];
            const newValue = before + key + closingChar + after;

            setCode(newValue);
            // Use setTimeout to ensure cursor is set after state update
            setTimeout(() => {
                target.selectionStart = start + 1;
                target.selectionEnd = start + 1;
            }, 0);
        }
    };

    const handleCodeChange = (localCode) => {
        setCode(localCode);
        localStorage.setItem("code", localCode);
    };
    return (
        <div className="mb-4 w-11/12 flex flex-col">
            <Editor
                ref={editorRef}
                value={code}
                tabSize={4}
                onValueChange={handleCodeChange}
                onKeyDown={handleKeyDown} // Add auto-closing logic
                highlight={(code) =>
                    highlight(code, languages.python, "python")
                }
                padding={10}
                style={{
                    fontFamily: "monospace",
                    fontSize: "14px",
                    width: "100%",
                    backgroundColor: "#101828",
                    color: "#ffffff",
                    border: "1px solid #2d4373",
                    borderRadius: "0.5rem",
                    minHeight: "100px",
                    outline: "none" // Remove default focus outline
                }}
                textareaClassName="focus:ring-2 focus:ring-blue-500" // Add focus ring to the underlying textarea
            />
        </div>
    );
};

export default CodeEditor;
