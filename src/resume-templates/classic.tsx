import React from 'react';
import { Resume } from '@/types/resume';

interface ClassicTemplateProps {
  resume: Resume;
}

export const ClassicTemplate: React.FC<ClassicTemplateProps> = ({ resume }) => {
  return (
    <html>
      <head>
        <meta charSet="UTF-8" />
        <title>Resume - {resume.basics.fullName}</title>
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Times New Roman', serif;
            font-size: 11pt;
            line-height: 1.4;
            color: #333;
            max-width: 8.5in;
            margin: 0 auto;
            padding: 0.75in;
            background: white;
          }
          
          .header {
            text-align: center;
            margin-bottom: 0.5in;
            border-bottom: 1pt solid #333;
            padding-bottom: 0.25in;
          }
          
          .name {
            font-size: 18pt;
            font-weight: bold;
            margin-bottom: 0.1in;
          }
          
          .title {
            font-size: 12pt;
            font-style: italic;
            margin-bottom: 0.1in;
          }
          
          .contact-info {
            font-size: 10pt;
            margin-bottom: 0.05in;
          }
          
          .section {
            margin-bottom: 0.3in;
            page-break-inside: avoid;
          }
          
          .section-title {
            font-size: 14pt;
            font-weight: bold;
            text-transform: uppercase;
            border-bottom: 1pt solid #333;
            margin-bottom: 0.15in;
            padding-bottom: 0.05in;
          }
          
          .experience-item,
          .education-item,
          .project-item {
            margin-bottom: 0.2in;
            page-break-inside: avoid;
          }
          
          .item-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.05in;
          }
          
          .company,
          .institution,
          .project-name {
            font-weight: bold;
            font-size: 12pt;
          }
          
          .role,
          .degree {
            font-style: italic;
            font-size: 11pt;
          }
          
          .date {
            font-size: 10pt;
            color: #666;
          }
          
          ul {
            margin: 0.1in 0 0 0.2in;
            padding-left: 0;
          }
          
          li {
            margin-bottom: 0.05in;
            list-style-type: disc;
          }
          
          .skills-category {
            margin-bottom: 0.1in;
          }
          
          .skills-category-name {
            font-weight: bold;
            display: inline;
          }
          
          .skills-items {
            display: inline;
            margin-left: 0.1in;
          }
          
          .summary {
            text-align: justify;
            margin-bottom: 0.2in;
            line-height: 1.3;
          }
          
          @media print {
            body {
              padding: 0.5in;
            }
            .section {
              page-break-inside: avoid;
            }
          }
        `}</style>
      </head>
      <body>
        <div className="header">
          <div className="name">{resume.basics.fullName}</div>
          {resume.basics.title && <div className="title">{resume.basics.title}</div>}
          <div className="contact-info">
            {resume.basics.email && <span>{resume.basics.email}</span>}
            {resume.basics.phone && resume.basics.email && <span> • </span>}
            {resume.basics.phone && <span>{resume.basics.phone}</span>}
            {resume.basics.location && (resume.basics.email || resume.basics.phone) && <span> • </span>}
            {resume.basics.location && <span>{resume.basics.location}</span>}
          </div>
          {resume.basics.links && resume.basics.links.length > 0 && (
            <div className="contact-info">
              {resume.basics.links.map((link, index) => (
                <span key={index}>
                  {index > 0 && ' • '}
                  {link.label}: {link.url}
                </span>
              ))}
            </div>
          )}
        </div>

        {resume.summary && (
          <div className="section">
            <div className="section-title">Summary</div>
            <div className="summary">{resume.summary}</div>
          </div>
        )}

        {resume.experience && resume.experience.length > 0 && (
          <div className="section">
            <div className="section-title">Experience</div>
            {resume.experience.map((exp, index) => (
              <div key={index} className="experience-item">
                <div className="item-header">
                  <div>
                    <div className="company">{exp.company}</div>
                    <div className="role">{exp.role}</div>
                  </div>
                  <div className="date">
                    {exp.start} - {exp.end || 'Present'}
                  </div>
                </div>
                {exp.bullets && exp.bullets.length > 0 && (
                  <ul>
                    {exp.bullets.map((bullet, bulletIndex) => (
                      <li key={bulletIndex}>{bullet}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {resume.education && resume.education.length > 0 && (
          <div className="section">
            <div className="section-title">Education</div>
            {resume.education.map((edu, index) => (
              <div key={index} className="education-item">
                <div className="item-header">
                  <div>
                    <div className="institution">{edu.institution}</div>
                    <div className="degree">{edu.degree}</div>
                  </div>
                  <div className="date">
                    {edu.start} - {edu.end}
                  </div>
                </div>
                {edu.details && edu.details.length > 0 && (
                  <ul>
                    {edu.details.map((detail, detailIndex) => (
                      <li key={detailIndex}>{detail}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {resume.projects && resume.projects.length > 0 && (
          <div className="section">
            <div className="section-title">Projects</div>
            {resume.projects.map((project, index) => (
              <div key={index} className="project-item">
                <div className="project-name">
                  {project.name}
                  {project.link && (
                    <span style={{ fontWeight: 'normal', fontSize: '10pt', marginLeft: '0.1in' }}>
                      ({project.link})
                    </span>
                  )}
                </div>
                {project.description && <div style={{ fontStyle: 'italic', marginBottom: '0.05in' }}>{project.description}</div>}
                {project.bullets && project.bullets.length > 0 && (
                  <ul>
                    {project.bullets.map((bullet, bulletIndex) => (
                      <li key={bulletIndex}>{bullet}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {resume.skills && resume.skills.length > 0 && (
          <div className="section">
            <div className="section-title">Skills</div>
            {resume.skills.map((skillCategory, index) => (
              <div key={index} className="skills-category">
                <span className="skills-category-name">{skillCategory.category}:</span>
                <span className="skills-items">{skillCategory.items.join(', ')}</span>
              </div>
            ))}
          </div>
        )}

        {resume.awards && resume.awards.length > 0 && (
          <div className="section">
            <div className="section-title">Awards & Achievements</div>
            {resume.awards.map((award, index) => (
              <div key={index} style={{ marginBottom: '0.1in' }}>
                <span style={{ fontWeight: 'bold' }}>{award.name}</span>
                {award.by && <span> - {award.by}</span>}
                {award.year && <span> ({award.year})</span>}
              </div>
            ))}
          </div>
        )}
      </body>
    </html>
  );
};