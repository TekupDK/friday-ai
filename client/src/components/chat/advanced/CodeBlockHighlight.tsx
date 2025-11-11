/**
 * CODE BLOCK HIGHLIGHT - Syntax highlighting for code
 */

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Code, Copy, Check, Download, Play } from "lucide-react";
import { useState } from "react";

export interface CodeBlockData {
  language: string;
  code: string;
  filename?: string;
  editable?: boolean;
  runnable?: boolean;
}

interface CodeBlockHighlightProps {
  data: CodeBlockData;
  onCopy?: (code: string) => void;
  onRun?: (code: string) => void;
  onEdit?: (code: string) => void;
  onDownload?: (filename: string, code: string) => void;
}

const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript', icon: '🟨' },
  { id: 'typescript', label: 'TypeScript', icon: '🔷' },
  { id: 'python', label: 'Python', icon: '🐍' },
  { id: 'java', label: 'Java', icon: '☕' },
  { id: 'html', label: 'HTML', icon: '🌐' },
  { id: 'css', label: 'CSS', icon: '🎨' },
  { id: 'json', label: 'JSON', icon: '📄' },
  { id: 'sql', label: 'SQL', icon: '🗃️' },
  { id: 'bash', label: 'Bash', icon: '💻' },
  { id: 'markdown', label: 'Markdown', icon: '📝' }
];

const SAMPLE_CODE = {
  javascript: `// JavaScript Example
function calculateTotal(items) {
  return items.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);
}

const cart = [
  { name: 'Product A', price: 100, quantity: 2 },
  { name: 'Product B', price: 50, quantity: 3 }
];

console.log('Total:', calculateTotal(cart));`,

  typescript: `// TypeScript Example
interface Product {
  name: string;
  price: number;
  quantity: number;
}

function calculateTotal(items: Product[]): number {
  return items.reduce((sum: number, item: Product) => {
    return sum + (item.price * item.quantity);
  }, 0);
}

const cart: Product[] = [
  { name: 'Product A', price: 100, quantity: 2 },
  { name: 'Product B', price: 50, quantity: 3 }
];

console.log('Total:', calculateTotal(cart));`,

  python: `# Python Example
def calculate_total(items):
    """Calculate total price of items in cart"""
    return sum(item['price'] * item['quantity'] for item in items)

cart = [
    {'name': 'Product A', 'price': 100, 'quantity': 2},
    {'name': 'Product B', 'price': 50, 'quantity': 3}
]

print(f"Total: {calculate_total(cart)}")`,

  sql: `-- SQL Example
SELECT 
    p.name,
    p.price,
    c.quantity,
    (p.price * c.quantity) as total
FROM products p
JOIN cart c ON p.id = c.product_id
WHERE c.user_id = 123
ORDER BY total DESC;`
};

export function CodeBlockHighlight({ 
  data,
  onCopy,
  onRun,
  onEdit,
  onDownload 
}: CodeBlockHighlightProps) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableCode, setEditableCode] = useState(data.code);
  const [selectedLanguage, setSelectedLanguage] = useState(data.language);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(editableCode);
    setCopied(true);
    onCopy?.(editableCode);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEdit = () => {
    if (isEditing) {
      onEdit?.(editableCode);
    }
    setIsEditing(!isEditing);
  };

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    if (SAMPLE_CODE[language as keyof typeof SAMPLE_CODE]) {
      setEditableCode(SAMPLE_CODE[language as keyof typeof SAMPLE_CODE]);
    }
  };

  const handleDownload = () => {
    const filename = data.filename || `code.${selectedLanguage}`;
    onDownload?.(filename, editableCode);
  };

  const getLanguageIcon = (language: string) => {
    const lang = LANGUAGES.find(l => l.id === language);
    return lang?.icon || '📄';
  };

  const getLanguageLabel = (language: string) => {
    const lang = LANGUAGES.find(l => l.id === language);
    return lang?.label || language;
  };

  const getLineCount = (code: string) => {
    return code.split('\n').length;
  };

  return (
    <Card className="border-l-4 border-l-purple-500">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-md">
              <Code className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold">Code Block</h4>
              <p className="text-xs text-muted-foreground">Syntax highlighting</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">{getLanguageIcon(selectedLanguage)}</span>
            <Badge variant="secondary">{getLanguageLabel(selectedLanguage)}</Badge>
          </div>
        </div>

        {/* Language Selector */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Vælg sprog:</label>
          <div className="grid grid-cols-5 gap-1">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.id}
                onClick={() => handleLanguageChange(lang.id)}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors",
                  selectedLanguage === lang.id
                    ? "bg-purple-500 text-white"
                    : "bg-muted hover:bg-muted/70"
                )}
              >
                <span>{lang.icon}</span>
                <span>{lang.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Code Editor */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-medium text-muted-foreground">
              {data.filename || `code.${selectedLanguage}`} ({getLineCount(editableCode)} linjer)
            </label>
            {data.editable && (
              <Button size="sm" variant="ghost" onClick={handleEdit}>
                {isEditing ? 'Gem' : 'Rediger'}
              </Button>
            )}
          </div>
          
          <div className="relative">
            {/* Line Numbers */}
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 p-3 select-none">
              {editableCode.split('\n').map((_, index) => (
                <div key={index} className="text-right">
                  {index + 1}
                </div>
              ))}
            </div>
            
            {/* Code Content */}
            <div className="ml-12">
              {isEditing ? (
                <textarea
                  value={editableCode}
                  onChange={(e) => setEditableCode(e.target.value)}
                  className="w-full h-64 p-3 font-mono text-sm bg-background border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                  spellCheck={false}
                />
              ) : (
                <pre className="h-64 p-3 font-mono text-sm bg-gray-900 text-gray-100 rounded-lg overflow-x-auto">
                  <code>{editableCode}</code>
                </pre>
              )}
            </div>
          </div>
        </div>

        {/* Code Stats */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/20 text-center">
            <p className="font-medium text-purple-700 dark:text-purple-400">
              {getLineCount(editableCode)}
            </p>
            <p className="text-purple-600 dark:text-purple-500">Linjer</p>
          </div>
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-center">
            <p className="font-medium text-blue-700 dark:text-blue-400">
              {editableCode.length}
            </p>
            <p className="text-blue-600 dark:text-blue-500">Tegn</p>
          </div>
          <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/20 text-center">
            <p className="font-medium text-green-700 dark:text-green-400">
              {editableCode.split('\n').filter(line => line.trim()).length}
            </p>
            <p className="text-green-600 dark:text-green-500">Aktive</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button onClick={handleCopy} variant="outline" className="flex-1">
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Kopieret!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Kopier
              </>
            )}
          </Button>
          
          <Button onClick={handleDownload} variant="outline" className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          
          {data.runnable && (
            <Button onClick={() => onRun?.(editableCode)} className="flex-1 bg-linear-to-r from-green-600 to-emerald-600">
              <Play className="w-4 h-4 mr-2" />
              Kør
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
