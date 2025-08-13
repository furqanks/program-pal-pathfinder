import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { FileText, BookOpen, GraduationCap, Award, User, Mail } from "lucide-react";

interface DocumentTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  icon: React.ReactNode;
  content: string;
  tags: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
}

interface DocumentTemplatesProps {
  documentType: string;
  onSelectTemplate: (template: DocumentTemplate) => void;
  isOpen: boolean;
  onClose: () => void;
}

const templates: DocumentTemplate[] = [
  {
    id: "sop-business",
    name: "Business School SOP",
    type: "SOP",
    description: "Structured template for MBA and business program applications",
    icon: <GraduationCap className="h-5 w-5" />,
    difficulty: "Intermediate",
    tags: ["MBA", "Business", "Leadership"],
    content: `# Statement of Purpose - Business Administration

## Introduction & Career Goals
Start with a compelling hook that demonstrates your passion for business. What specific moment or experience sparked your interest in pursuing an MBA? Connect this to your long-term career vision.

*Example: "Standing in the boardroom during my first strategy meeting, I realized that impactful business decisions require both analytical rigor and creative thinking—a combination I'm eager to develop through an MBA program."*

## Professional Experience & Achievements
Detail your work experience, highlighting:
- Key accomplishments with quantifiable results
- Leadership experiences and team management
- Problem-solving scenarios where you made a significant impact
- Skills you've developed that are relevant to business school

## Why This Program
Explain specifically why you've chosen this MBA program:
- Specific courses, professors, or research areas that align with your goals
- How the school's culture and values match your own
- Opportunities for networking and career development unique to this program
- Any connections you've made with current students or alumni

## Future Contribution & Impact
Describe how you plan to:
- Contribute to the classroom and campus community
- Apply your learning to your career goals
- Make a positive impact in your chosen industry or field
- Give back to the program and future students

## Conclusion
Tie everything together by reaffirming your commitment and enthusiasm for the program. End with a forward-looking statement about your potential contributions and achievements.

---
*Word Count Target: 750-1000 words*
*Remember to maintain authenticity while following this structure*`
  },
  {
    id: "cv-academic",
    name: "Academic CV",
    type: "CV",
    description: "Comprehensive CV template for academic and research positions",
    icon: <FileText className="h-5 w-5" />,
    difficulty: "Advanced",
    tags: ["Academic", "Research", "PhD"],
    content: `# [Your Full Name]
**[Your Title/Current Position]**

## Contact Information
- Email: [professional.email@university.edu]
- Phone: [+1 (xxx) xxx-xxxx]
- Address: [City, State, Country]
- LinkedIn: [linkedin.com/in/yourprofile]
- ORCID: [0000-0000-0000-0000]

## Education
**PhD in [Field], [University Name]** | [Year - Present/Year]
- Dissertation: "[Title of Your Dissertation]"
- Advisor: [Professor Name]
- GPA: [X.X/4.0] (if impressive)

**Master of [Degree], [University Name]** | [Year - Year]
- Thesis: "[Title of Your Thesis]" 
- GPA: [X.X/4.0] (if impressive)

**Bachelor of [Degree], [University Name]** | [Year - Year]
- Honors: [Magna Cum Laude, Phi Beta Kappa, etc.]
- GPA: [X.X/4.0] (if impressive)

## Research Experience
**[Position Title]** | [Institution] | [Dates]
- Brief description of research focus and methodologies
- Key findings and contributions
- Funding sources and amounts (if applicable)

## Publications
### Peer-Reviewed Articles
1. [Last name, First initial.] ([Year]). [Title]. *Journal Name*, [Volume(Issue)], [pages]. DOI: [doi]

### Conference Presentations
1. [Last name, First initial.] ([Year, Month]). [Title]. Paper presented at [Conference Name], [Location].

### Working Papers/Manuscripts in Preparation
1. [Title] (with [Co-authors if any])

## Grants and Funding
- [Grant Name], [Amount], [Funding Agency], [Year]
- [Fellowship Name], [Amount], [Year]

## Teaching Experience
**[Course Title]** | [University] | [Semester Year]
- Role: [Instructor/TA/Guest Lecturer]
- Enrollment: [X students]
- Course evaluation: [X.X/5.0] (if strong)

## Awards and Honors
- [Award Name], [Institution/Organization], [Year]
- [Honor/Recognition], [Year]

## Skills
**Research Methods:** [Quantitative, Qualitative, Mixed Methods, etc.]
**Software:** [R, Python, STATA, NVivo, etc.]
**Languages:** [Language (Proficiency Level)]

## Professional Service
**Reviewer for Journals:**
- [Journal Name] ([Year-Present])

**Committee Service:**
- [Committee Name], [Institution], [Year-Year]

## Professional Memberships
- [Professional Organization], [Year-Present]
- [Academic Society], [Year-Present]

---
*Customize sections based on your field and career stage*
*Include only relevant sections for your specific application*`
  },
  {
    id: "essay-personal",
    name: "Personal Statement Essay",
    type: "Essay",
    description: "Compelling personal essay template for college applications",
    icon: <User className="h-5 w-5" />,
    difficulty: "Beginner",
    tags: ["Undergraduate", "Personal", "College"],
    content: `# Personal Statement Essay

## Opening Hook
Start with a vivid scene, moment, or observation that immediately draws the reader in. This should be specific and personal to you.

*Example: "The smell of my grandmother's spices still transports me to her tiny kitchen, where I first learned that food isn't just sustenance—it's storytelling."*

## The Story/Experience
Develop your opening with a specific narrative that reveals something meaningful about you:
- What happened? (Be specific and detailed)
- Why was this significant to you?
- What did you learn or realize?
- How did it change your perspective?

## Reflection & Growth
Connect your story to broader themes about who you are:
- What values does this experience reflect?
- How has it shaped your character or worldview?
- What skills or qualities did you develop?
- How do you apply these lessons in other areas of your life?

## Connection to Your Goals
Bridge your personal growth to your academic and future aspirations:
- How does this experience relate to your intended major or career path?
- What specific opportunities at this university excite you?
- How will you contribute to the campus community?

## Looking Forward
End with a forward-thinking statement that shows:
- Your enthusiasm for continued growth
- Specific ways you'll apply your values and experiences
- Your potential for making a positive impact

## Conclusion
Circle back to your opening in a meaningful way that shows growth and future potential.

---
**Writing Tips:**
- Show, don't tell - use specific examples and details
- Be authentic - write in your genuine voice
- Stay focused - stick to one main theme or story
- Word count: Usually 500-650 words
- Avoid clichés and overused topics unless you have a unique angle

**Before submitting:**
- Read it aloud to check flow
- Have others review for clarity and impact
- Ensure it answers: "What makes you unique?"*`
  },
  {
    id: "lor-academic",
    name: "Letter of Recommendation Request",
    type: "LOR",
    description: "Template for requesting academic letters of recommendation",
    icon: <Mail className="h-5 w-5" />,
    difficulty: "Intermediate",
    tags: ["Academic", "Reference", "Graduate"],
    content: `# Letter of Recommendation Request

**Subject: Letter of Recommendation Request for [Program Name] Application**

Dear Professor/Dr. [Last Name],

## Introduction & Context
I hope this email finds you well. I am writing to ask if you would be willing to write a letter of recommendation for my application to [specific program/position] at [institution name]. 

## Your Relationship & Qualifications
I had the privilege of being your student in [course name] during [semester/year], where I [specific achievement or interaction]. I believe you would be an excellent recommender because [specific reason related to their knowledge of your work/character].

## Program/Position Details
I am applying for:
- **Program:** [Full name of program/position]
- **Institution:** [University/Organization name]
- **Application Deadline:** [Date]
- **Submission Method:** [Online portal/email/mail]

## What I'm Seeking
This program focuses on [brief description], which aligns perfectly with my interests in [your specific interests]. I would greatly appreciate a letter that highlights:
- My academic performance and intellectual curiosity
- My research potential and analytical skills
- My ability to work independently and collaborate effectively
- Any specific projects or achievements from your class

## Supporting Materials
To assist you in writing the letter, I have attached:
- My current CV/resume
- Personal statement/statement of purpose
- Transcript (unofficial)
- [Any relevant work samples or projects]

## Timeline & Logistics
- **Deadline:** [Date - give at least 3-4 weeks notice]
- **Submission:** [Specific instructions about how to submit]
- **Length:** [Typically 1-2 pages]

I understand that writing letters of recommendation requires significant time and effort, and I truly appreciate your consideration. If you are unable to write a strong letter of recommendation, I completely understand and would appreciate you letting me know.

## Follow-up
I will send you a reminder [X weeks] before the deadline, and I'm happy to provide any additional information you might need. After I submit my application, I will keep you updated on the outcome.

Thank you very much for your time and consideration. I look forward to hearing from you.

Best regards,
[Your Full Name]
[Your Student ID - if applicable]
[Your Phone Number]
[Your Email Address]

---
**Tips for Success:**
- Give recommenders at least 3-4 weeks notice
- Provide all materials they need in one organized email
- Choose recommenders who know your work well
- Follow up politely if needed
- Send thank you notes and updates*`
  },
  {
    id: "scholarship-essay",
    name: "Scholarship Essay",
    type: "ScholarshipEssay",
    description: "Template for scholarship application essays",
    icon: <Award className="h-5 w-5" />,
    difficulty: "Intermediate",
    tags: ["Scholarship", "Financial Aid", "Achievement"],
    content: `# Scholarship Essay Template

## Opening Statement
Begin with a compelling statement that establishes your passion, goals, or the challenge you're addressing.

*Example: "Education has always been my family's beacon of hope, even when financial constraints threatened to dim its light."*

## Personal Background & Challenges
Describe your background and any obstacles you've overcome:
- Family circumstances or financial challenges
- Personal hardships that have shaped your character
- Community or cultural context that influences your perspective
- How these experiences have motivated your educational goals

## Academic Excellence & Achievements
Highlight your academic accomplishments:
- GPA, test scores, class rank (if strong)
- Specific courses or subjects where you've excelled
- Academic awards, honors, or recognition
- Research projects or academic competitions

## Leadership & Community Involvement
Demonstrate your commitment to making a difference:
- Leadership roles in school, community, or organizations
- Volunteer work and community service
- Initiative you've taken to solve problems or help others
- Impact you've made in your community

## Career Goals & Aspirations
Explain your future plans and how education fits in:
- Specific career path you're pursuing
- How your intended major/program will help you reach your goals
- Long-term vision for using your education to benefit others
- Industries or fields where you plan to make an impact

## Why This Scholarship Matters
Connect the scholarship to your goals:
- Specific financial challenges this scholarship would address
- How receiving this award would change your educational trajectory
- Opportunities it would create for you academically and professionally
- Ways you plan to pay it forward in the future

## Connection to Scholarship Values
Show alignment with the scholarship's mission:
- Research the organization's values and mission
- Explain how your goals align with their objectives
- Demonstrate how you embody the qualities they're looking for
- Share specific examples that illustrate these connections

## Future Impact & Giving Back
Describe how you'll use your education to benefit others:
- Plans for community service or social impact
- How you'll mentor or help future students
- Ways you'll contribute to your field or profession
- Vision for making a positive difference in the world

## Conclusion
End with a strong statement that:
- Reaffirms your commitment to education and your goals
- Expresses gratitude for the opportunity
- Leaves a lasting impression about your potential

---
**Key Guidelines:**
- Follow the specific prompt exactly
- Stay within word/character limits
- Use specific examples and avoid generalizations
- Show, don't just tell about your qualities
- Proofread carefully for errors
- Have others review before submitting

**Common Scholarship Essay Prompts:**
- "Describe a challenge you've overcome"
- "Explain your career goals and how this scholarship will help"
- "Tell us about your leadership experience"
- "How will you use your education to benefit others?"*`
  }
];

const DocumentTemplates = ({ documentType, onSelectTemplate, isOpen, onClose }: DocumentTemplatesProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);

  const filteredTemplates = templates.filter(template => 
    template.type === documentType
  );

  const handleSelectTemplate = (template: DocumentTemplate) => {
    onSelectTemplate(template);
    onClose();
  };

  const difficultyColors = {
    Beginner: "bg-green-100 text-green-800",
    Intermediate: "bg-yellow-100 text-yellow-800", 
    Advanced: "bg-red-100 text-red-800"
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose a Template for {documentType}</DialogTitle>
          <DialogDescription>
            Select a template to get started with structured guidance and examples
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {template.icon}
                    <CardTitle className="text-base">{template.name}</CardTitle>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={difficultyColors[template.difficulty]}
                  >
                    {template.difficulty}
                  </Badge>
                </div>
                <CardDescription className="text-sm">
                  {template.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-1 mb-3">
                  {template.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedTemplate(template)}
                  >
                    Preview
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleSelectTemplate(template)}
                  >
                    Use Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No templates available for {documentType} yet.</p>
            <p className="text-sm">Templates are being added for more document types!</p>
          </div>
        )}

        {/* Template Preview Dialog */}
        {selectedTemplate && (
          <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedTemplate.icon}
                  {selectedTemplate.name}
                </DialogTitle>
                <DialogDescription>
                  {selectedTemplate.description}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="prose prose-sm max-w-none bg-muted/20 p-4 rounded-md">
                  <pre className="whitespace-pre-wrap font-sans text-sm">
                    {selectedTemplate.content}
                  </pre>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button 
                    variant="outline"
                    onClick={() => setSelectedTemplate(null)}
                  >
                    Close Preview
                  </Button>
                  <Button onClick={() => handleSelectTemplate(selectedTemplate)}>
                    Use This Template
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DocumentTemplates;