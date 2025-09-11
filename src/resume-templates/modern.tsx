import React from 'react';
import { Resume } from '@/types/resume';

interface ModernTemplateProps {
  resume: Resume;
}

export const ModernTemplate: React.FC<ModernTemplateProps> = ({ resume }) => {
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
            font-family: 'Calibri', 'Arial', sans-serif;
            font-size: 11pt;
            line-height: 1.5;
            color: #2c3e50;
            max-width: 8.5in;
            margin: 0 auto;
            padding: 0.75in;
            background: white;
          }
          
          .header {
            margin-bottom: 0.4in;
            padding: 0.3in;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 8pt;
          }
          
          .name {
            font-size: 22pt;
            font-weight: 300;
            letter-spacing: 1pt;
            margin-bottom: 0.1in;
          }
          
          .title {
            font-size: 14pt;
            font-weight: 400;
            margin-bottom: 0.15in;
            opacity: 0.9;
          }
          
          .contact-info {
            font-size: 10pt;
            margin-bottom: 0.05in;
            display: flex;
            flex-wrap: wrap;
            gap: 0.15in;
          }
          
          .contact-item {
            display: flex;
            align-items: center;
          }
          
          .section {
            margin-bottom: 0.35in;
            page-break-inside: avoid;
          }
          
          .section-title {
            font-size: 16pt;
            font-weight: 600;
            color: #667eea;
            margin-bottom: 0.2in;
            padding-bottom: 0.08in;
            border-bottom: 2pt solid #667eea;
            position: relative;
          }
          
          .section-title::after {
            content: '';
            position: absolute;
            bottom: -2pt;
            left: 0;
            width: 40pt;
            height: 2pt;
            background: #764ba2;
          }
          
          .experience-item,
          .education-item,
          .project-item {
            margin-bottom: 0.25in;
            padding: 0.15in;
            background: #f8f9fa;
            border-radius: 6pt;
            border-left: 3pt solid #667eea;
            page-break-inside: avoid;
          }
          
          .item-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.1in;
            align-items: flex-start;
          }
          
          .company,
          .institution,
          .project-name {
            font-weight: 600;
            font-size: 13pt;
            color: #2c3e50;
          }
          
          .role,
          .degree {
            font-size: 11pt;
            color: #667eea;
            font-weight: 500;
            margin-top: 0.02in;
          }
          
          .date {
            font-size: 10pt;
            color: #7f8c8d;
            font-weight: 500;
            background: white;
            padding: 0.05in 0.1in;
            border-radius: 12pt;
            white-space: nowrap;
          }
          
          ul {
            margin: 0.1in 0 0 0.2in;
            padding-left: 0;
          }
          
          li {
            margin-bottom: 0.08in;
            list-style: none;
            position: relative;
            padding-left: 0.15in;
          }
          
          li::before {
            content: '▸';
            position: absolute;
            left: 0;
            color: #667eea;
            font-weight: bold;
          }
          
          .skills-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200pt, 1fr));
            gap: 0.15in;
          }
          
          .skills-category {
            background: #f8f9fa;
            padding: 0.15in;
            border-radius: 6pt;
            border: 1pt solid #e9ecef;
          }
          
          .skills-category-name {
            font-weight: 600;
            color: #667eea;
            font-size: 11pt;
            display: block;
            margin-bottom: 0.08in;
          }
          
          .skills-items {
            font-size: 10pt;
            line-height: 1.4;
            color: #495057;
          }
          
          .summary {
            text-align: justify;
            margin-bottom: 0.2in;
            line-height: 1.6;
            padding: 0.2in;
            background: #f8f9fa;
            border-radius: 6pt;
            border-left: 3pt solid #667eea;
            font-style: italic;
          }
          
          .awards-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.1in 0.15in;
            background: #f8f9fa;
            margin-bottom: 0.1in;
            border-radius: 6pt;
            border-left: 3pt solid #28a745;
          }
          
          .award-name {
            font-weight: 600;
            color: #2c3e50;
          }
          
          .award-details {
            font-size: 10pt;
            color: #6c757d;
          }
          
          @media print {
            body {
              padding: 0.5in;
            }
            .section {
              page-break-inside: avoid;
            }
            .header {
              background: #667eea !important;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
          }
        `}</style>
      </head>
      <body>
        <div className="header">
          <div className="name">{resume.basics.fullName}</div>
          {resume.basics.title && <div className="title">{resume.basics.title}</div>}
          <div className="contact-info">
            {resume.basics.email && (
              <div className="contact-item">{resume.basics.email}</div>
            )}
            {resume.basics.phone && (
              <div className="contact-item">{resume.basics.phone}</div>
            )}
            {resume.basics.location && (
              <div className="contact-item">{resume.basics.location}</div>
            )}
            {resume.basics.links && resume.basics.links.map((link, index) => (
              <div key={index} className="contact-item">
                {link.label}: {link.url}
              </div>
            ))}
          </div>
        </div>

        {resume.summary && (
          <div className="section">
            <div className="section-title">Professional Summary</div>
            <div className="summary">{resume.summary}</div>
          </div>
        )}

        {resume.experience && resume.experience.length > 0 && (
          <div className="section">
            <div className="section-title">Professional Experience</div>
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
            <div className="section-title">Notable Projects</div>
            {resume.projects.map((project, index) => (
              <div key={index} className="project-item">
                <div className="project-name">
                  {project.name}
                  {project.link && (
                    <span style={{ fontWeight: 'normal', fontSize: '10pt', marginLeft: '0.1in', color: '#667eea' }}>
                      — {project.link}
                    </span>
                  )}
                </div>
                {project.description && (
                  <div style={{ fontStyle: 'italic', marginBottom: '0.08in', color: '#6c757d' }}>
                    {project.description}
                  </div>
                )}
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
            <div className="section-title">Core Competencies</div>
            <div className="skills-grid">
              {resume.skills.map((skillCategory, index) => (
                <div key={index} className="skills-category">
                  <span className="skills-category-name">{skillCategory.category}</span>
                  <div className="skills-items">{skillCategory.items.join(' • ')}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {resume.awards && resume.awards.length > 0 && (
          <div className="section">
            <div className="section-title">Awards & Recognition</div>
            {resume.awards.map((award, index) => (
              <div key={index} className="awards-item">
                <div>
                  <div className="award-name">{award.name}</div>
                  {award.by && <div className="award-details">by {award.by}</div>}
                </div>
                {award.year && <div className="award-details">{award.year}</div>}
              </div>
            ))}
          </div>
        )}
      </body>
    </html>
  );
};