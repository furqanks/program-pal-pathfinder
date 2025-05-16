
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Key, Lock, Save, RefreshCw } from "lucide-react";
import { getApiKey, setApiKey, API_KEYS } from "@/utils/apiKeys";

const Settings = () => {
  const [openaiKey, setOpenaiKey] = useState("");
  const [perplexityKey, setPerplexityKey] = useState("");
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [showPerplexityKey, setShowPerplexityKey] = useState(false);
  
  // Load existing keys on mount
  useEffect(() => {
    const storedOpenaiKey = getApiKey(API_KEYS.OPENAI);
    const storedPerplexityKey = getApiKey(API_KEYS.PERPLEXITY);
    
    if (storedOpenaiKey) {
      setOpenaiKey(storedOpenaiKey);
    }
    
    if (storedPerplexityKey) {
      setPerplexityKey(storedPerplexityKey);
    }
  }, []);
  
  const handleSaveOpenaiKey = () => {
    if (!openaiKey.trim()) {
      toast.error("Please enter an OpenAI API key");
      return;
    }
    
    setApiKey(API_KEYS.OPENAI, openaiKey);
    toast.success("OpenAI API key saved successfully");
  };
  
  const handleSavePerplexityKey = () => {
    if (!perplexityKey.trim()) {
      toast.error("Please enter a Perplexity API key");
      return;
    }
    
    setApiKey(API_KEYS.PERPLEXITY, perplexityKey);
    toast.success("Perplexity API key saved successfully");
  };
  
  const handleClearKeys = () => {
    setOpenaiKey("");
    setPerplexityKey("");
    localStorage.removeItem(API_KEYS.OPENAI);
    localStorage.removeItem(API_KEYS.PERPLEXITY);
    toast.success("API keys cleared successfully");
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure your API keys for AI services
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              OpenAI API Key
            </CardTitle>
            <CardDescription>
              Required for document review and shortlist insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="openai-key">API Key</Label>
              <div className="flex space-x-2">
                <Input
                  id="openai-key"
                  type={showOpenaiKey ? "text" : "password"}
                  placeholder="sk-..."
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                />
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                >
                  <Lock className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Get your API key from the <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">OpenAI dashboard</a>
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveOpenaiKey}>
              <Save className="mr-2 h-4 w-4" />
              Save OpenAI Key
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Perplexity API Key
            </CardTitle>
            <CardDescription>
              Required for program search functionality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="perplexity-key">API Key</Label>
              <div className="flex space-x-2">
                <Input
                  id="perplexity-key"
                  type={showPerplexityKey ? "text" : "password"}
                  placeholder="pplx-..."
                  value={perplexityKey}
                  onChange={(e) => setPerplexityKey(e.target.value)}
                />
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setShowPerplexityKey(!showPerplexityKey)}
                >
                  <Lock className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Get your API key from the <a href="https://www.perplexity.ai/settings/api" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Perplexity dashboard</a>
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSavePerplexityKey}>
              <Save className="mr-2 h-4 w-4" />
              Save Perplexity Key
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Reset API Keys</CardTitle>
          <CardDescription>
            Clear all stored API keys from your browser
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This will remove all API keys stored in your browser. You'll need to re-enter them to use the application's AI features.
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="destructive" onClick={handleClearKeys}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Clear All API Keys
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Settings;
