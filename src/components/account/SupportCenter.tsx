import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  HelpCircle, 
  MessageSquare, 
  Send, 
  Book, 
  Video, 
  Users, 
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Clock,
  Lightbulb
} from "lucide-react";

interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  created_at: string;
  updated_at: string;
}

const FAQ_ITEMS = [
  {
    question: "How do I upload a document for review?",
    answer: "Go to the Documents page and click 'Upload Document'. Select your file (PDF, DOC, or DOCX) and choose the document type. Our AI will analyze it and provide feedback within minutes."
  },
  {
    question: "What's included in the Premium plan?",
    answer: "Premium includes unlimited document reviews, advanced AI feedback, priority support, premium templates, and early access to new features."
  },
  {
    question: "How accurate is the AI feedback?",
    answer: "Our AI is trained on thousands of successful applications and provides feedback based on best practices. While helpful, we recommend using it alongside human advisors."
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Yes, you can cancel your subscription at any time from the Account page. You'll retain access until the end of your billing period."
  },
  {
    question: "How do I search for universities?",
    answer: "Use the Search page to find programs by location, major, requirements, and more. Save interesting programs to track deadlines and requirements."
  },
  {
    question: "Is my data secure?",
    answer: "Yes, we use industry-standard encryption and security measures. Your documents and personal information are never shared without your consent."
  }
];

const HELP_RESOURCES = [
  {
    title: "Getting Started Guide",
    description: "Learn the basics of using Heygrad",
    icon: Book,
    link: "#"
  },
  {
    title: "Video Tutorials",
    description: "Watch step-by-step guides for all features",
    icon: Video,
    link: "#"
  },
  {
    title: "Community Forum",
    description: "Connect with other students and share tips",
    icon: Users,
    link: "#"
  },
  {
    title: "Feature Requests",
    description: "Suggest new features and vote on ideas",
    icon: Lightbulb,
    link: "#"
  }
];

export const SupportCenter = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    description: '',
    category: '',
    priority: 'medium'
  });

  useEffect(() => {
    if (user) {
      loadSupportTickets();
    }
  }, [user]);

  const loadSupportTickets = async () => {
    try {
      const { data } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (data) {
        setTickets(data);
      }
    } catch (error) {
      console.error('Error loading support tickets:', error);
    }
  };

  const handleSubmitTicket = async () => {
    if (!user || !ticketForm.subject || !ticketForm.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user.id,
          subject: ticketForm.subject,
          description: ticketForm.description,
          category: ticketForm.category,
          priority: ticketForm.priority
        })
        .select()
        .single();

      if (error) throw error;

      setTickets(prev => [data, ...prev]);
      setTicketForm({
        subject: '',
        description: '',
        category: '',
        priority: 'medium'
      });

      toast({
        title: "Ticket submitted",
        description: "We've received your support request and will respond soon.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit support ticket. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="default">Open</Badge>;
      case 'in_progress':
        return <Badge variant="secondary">In Progress</Badge>;
      case 'resolved':
        return <Badge variant="outline">Resolved</Badge>;
      case 'closed':
        return <Badge variant="secondary">Closed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="secondary">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'open':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Help Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Book className="h-5 w-5" />
            Help Resources
          </CardTitle>
          <CardDescription>Quick access to guides and tutorials</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {HELP_RESOURCES.map((resource) => {
              const Icon = resource.icon;
              return (
                <Button
                  key={resource.title}
                  variant="outline"
                  className="h-auto p-4 justify-start"
                  asChild
                >
                  <a href={resource.link} target="_blank" rel="noopener noreferrer">
                    <div className="flex items-center gap-3 w-full">
                      <Icon className="h-6 w-6" />
                      <div className="text-left">
                        <div className="font-medium">{resource.title}</div>
                        <div className="text-sm text-muted-foreground">{resource.description}</div>
                      </div>
                      <ExternalLink className="h-4 w-4 ml-auto" />
                    </div>
                  </a>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Common questions and answers</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {FAQ_ITEMS.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Contact Support */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Contact Support
          </CardTitle>
          <CardDescription>Submit a support ticket for personalized help</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={ticketForm.subject}
                onChange={(e) => setTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Brief description of your issue"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={ticketForm.category} 
                onValueChange={(value) => setTicketForm(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">Technical Issue</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="feature">Feature Request</SelectItem>
                  <SelectItem value="account">Account</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select 
                value={ticketForm.priority} 
                onValueChange={(value) => setTicketForm(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={ticketForm.description}
                onChange={(e) => setTicketForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Please provide as much detail as possible about your issue..."
                rows={4}
              />
            </div>
          </div>

          <Button onClick={handleSubmitTicket} disabled={loading} className="w-full">
            <Send className="h-4 w-4 mr-2" />
            Submit Ticket
          </Button>
        </CardContent>
      </Card>

      {/* Support Tickets History */}
      {tickets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Support Tickets</CardTitle>
            <CardDescription>Track your previous support requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium">{ticket.subject}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {ticket.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(ticket.status)}
                      {getStatusBadge(ticket.status)}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      Category: <span className="capitalize">{ticket.category}</span>
                    </span>
                    {getPriorityBadge(ticket.priority)}
                    <span>Created: {new Date(ticket.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>Current status of our services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>AI Document Review</span>
              <Badge variant="default" className="bg-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Operational
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span>University Search</span>
              <Badge variant="default" className="bg-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Operational
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Notes & Organization</span>
              <Badge variant="default" className="bg-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Operational
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Payment Processing</span>
              <Badge variant="default" className="bg-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Operational
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};