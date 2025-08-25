import { useState } from 'react';
import { Search, Sparkles, Send, Brain, Lightbulb, ChartBar, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QueryInterfaceProps {
  onQuery: (question: string) => void;
  isLoading?: boolean;
}

const QueryInterface = ({ onQuery, isLoading = false }: QueryInterfaceProps) => {
  const [question, setQuestion] = useState('');

  const sampleQuestions = [
    { icon: <ChartBar className="w-3 h-3" />, text: "What are the top 5 products by revenue?" },
    { icon: <TrendingUp className="w-3 h-3" />, text: "Show me the monthly sales trend" },
    { icon: <Lightbulb className="w-3 h-3" />, text: "Which category has the highest profit margin?" },
    { icon: <Brain className="w-3 h-3" />, text: "Calculate the average order value" }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      onQuery(question);
    }
  };

  const handleSampleClick = (sample: string) => {
    setQuestion(sample);
    onQuery(sample);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="card-premium p-8">
        <div className="flex items-center gap-3 mb-6">
          <Brain className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Ask Your Data Anything</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What insights would you like to discover?"
              className="w-full pl-12 pr-32 py-4 bg-background/50 backdrop-blur-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading || !question.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 btn-premium"
            >
              {isLoading ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Analyze
                </>
              )}
            </Button>
          </div>
        </form>

        <div className="mt-8">
          <p className="text-sm text-muted-foreground mb-4 flex items-center">
            <Sparkles className="h-4 w-4 mr-2 text-primary" />
            Popular questions:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sampleQuestions.map((sample, index) => (
              <button
                key={index}
                onClick={() => handleSampleClick(sample.text)}
                disabled={isLoading}
                className="flex items-center gap-3 px-4 py-3 text-sm bg-background/50 hover:bg-background/80 border border-border/50 hover:border-primary/50 rounded-lg transition-all text-left"
              >
                <span className="text-primary">{sample.icon}</span>
                <span>{sample.text}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueryInterface;