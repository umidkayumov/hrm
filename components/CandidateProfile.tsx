import React, { useState, useRef } from 'react';
import { Submission } from '../types';
import { Icons } from './Icons';
import { summarizeCandidate } from '../services/geminiService';
import jsPDF from 'jspdf';

interface CandidateProfileProps {
  candidate: Submission;
  onBack: () => void;
}

const CandidateProfile: React.FC<CandidateProfileProps> = ({ candidate, onBack }) => {
  const [summary, setSummary] = useState<string | null>(candidate.aiSummary || null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  const handleGenerateSummary = async () => {
    setLoadingSummary(true);
    const result = await summarizeCandidate(candidate);
    setSummary(result);
    setLoadingSummary(false);
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPdf(true);

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Colors
      const primaryColor: [number, number, number] = [79, 70, 229]; // Indigo
      const darkColor: [number, number, number] = [30, 41, 59]; // Slate 800
      const grayColor: [number, number, number] = [100, 116, 139]; // Slate 500
      const lightGray: [number, number, number] = [241, 245, 249]; // Slate 100
      
      // Left sidebar
      const sidebarWidth = 65;
      pdf.setFillColor(...primaryColor);
      pdf.rect(0, 0, sidebarWidth, pageHeight, 'F');
      
      // Logo/Brand text on sidebar
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(22);
      pdf.setFont('helvetica', 'bold');
      pdf.text('HRISMI', 10, 20);
      
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'normal');
      pdf.text('HR Management System', 10, 26);
      
      // Profile photo
      const photoX = sidebarWidth / 2 - 15;
      const photoY = 35;
      const photoSize = 30;
      
      // Try to load and add the actual photo
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        await new Promise<void>((resolve, reject) => {
          img.onload = () => {
            // Create a canvas to clip image to circle
            const size = Math.min(img.width, img.height);
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            
            if (ctx) {
              // Create circular clipping path
              ctx.beginPath();
              ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
              ctx.closePath();
              ctx.clip();
              
              // Draw image centered
              const offsetX = (img.width - size) / 2;
              const offsetY = (img.height - size) / 2;
              ctx.drawImage(img, -offsetX, -offsetY, img.width, img.height);
              
              const imgData = canvas.toDataURL('image/png');
              
              // Add the circular photo
              pdf.addImage(imgData, 'PNG', photoX, photoY, photoSize, photoSize);
            }
            resolve();
          };
          img.onerror = () => reject(new Error('Failed to load image'));
          img.src = candidate.photoUrl;
        });
      } catch (imgError) {
        // Fallback to initials if image fails to load
        console.log('Image load failed, using initials fallback');
        pdf.setFillColor(255, 255, 255);
        pdf.circle(sidebarWidth / 2, photoY + photoSize / 2, photoSize / 2, 'F');
        
        pdf.setTextColor(...primaryColor);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        const initials = candidate.candidateName
          .split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);
        pdf.text(initials, sidebarWidth / 2 - 6, photoY + photoSize / 2 + 5);
      }
      
      // Sidebar contact info
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.text('CONTACT', 10, 90);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      
      // Email
      const emailLines = pdf.splitTextToSize(candidate.email, 50);
      pdf.text(emailLines, 10, 100);
      
      // Role
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.text('POSITION', 10, 120);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      const roleLines = pdf.splitTextToSize(candidate.role, 50);
      pdf.text(roleLines, 10, 128);
      
      // Experience
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.text('EXPERIENCE', 10, 148);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.text(`${candidate.answers['f_exp'] || 'N/A'} Years`, 10, 156);
      
      // Application Date
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.text('APPLIED', 10, 176);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      const appDate = new Date(candidate.submittedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      pdf.text(appDate, 10, 184);
      
      // Status badge
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.text('STATUS', 10, 204);
      
      const statusColors: Record<string, [number, number, number]> = {
        'new': [59, 130, 246],
        'reviewed': [234, 179, 8],
        'hired': [34, 197, 94],
        'rejected': [239, 68, 68]
      };
      
      pdf.setFillColor(...(statusColors[candidate.status] || [100, 116, 139]));
      pdf.roundedRect(10, 208, 40, 12, 3, 3, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text(candidate.status.toUpperCase(), 20, 216);
      
      // Footer on sidebar
      pdf.setTextColor(200, 200, 255);
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Generated by Hrismi', 10, pageHeight - 15);
      pdf.text(new Date().toLocaleDateString(), 10, pageHeight - 10);
      
      // ========== MAIN CONTENT AREA ==========
      const contentX = sidebarWidth + 15;
      const contentWidth = pageWidth - sidebarWidth - 25;
      let currentY = 20;
      
      // Candidate Name
      pdf.setTextColor(...darkColor);
      pdf.setFontSize(28);
      pdf.setFont('helvetica', 'bold');
      pdf.text(candidate.candidateName, contentX, currentY);
      currentY += 8;
      
      // Title/Role subtitle
      pdf.setTextColor(...grayColor);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(candidate.role, contentX, currentY);
      currentY += 15;
      
      // Divider line
      pdf.setDrawColor(...lightGray);
      pdf.setLineWidth(0.5);
      pdf.line(contentX, currentY, pageWidth - 10, currentY);
      currentY += 10;
      
      // AI Summary Section (if available)
      if (summary) {
        // Section header with icon
        pdf.setFillColor(238, 242, 255); // Indigo 50
        pdf.roundedRect(contentX, currentY - 4, contentWidth, 6, 1, 1, 'F');
        
        pdf.setTextColor(...primaryColor);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text('AI EXECUTIVE SUMMARY', contentX + 2, currentY);
        currentY += 8;
        
        pdf.setTextColor(...darkColor);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        const summaryLines = pdf.splitTextToSize(summary, contentWidth - 5);
        pdf.text(summaryLines, contentX, currentY);
        currentY += summaryLines.length * 4.5 + 10;
      }
      
      // Application Answers Section
      pdf.setFillColor(...lightGray);
      pdf.roundedRect(contentX, currentY - 4, contentWidth, 6, 1, 1, 'F');
      
      pdf.setTextColor(...primaryColor);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('APPLICATION DETAILS', contentX + 2, currentY);
      currentY += 12;
      
      // Application answers
      Object.entries(candidate.answers).forEach(([key, value]) => {
        if (key === 'f_photo') return;
        
        // Check if we need a new page
        if (currentY > pageHeight - 30) {
          pdf.addPage();
          currentY = 20;
        }
        
        const label = key.replace('f_', '').replace(/_/g, ' ').toUpperCase();
        
        // Label
        pdf.setTextColor(...grayColor);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.text(label, contentX, currentY);
        currentY += 5;
        
        // Value
        pdf.setTextColor(...darkColor);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        
        const valueStr = String(value);
        const valueLines = pdf.splitTextToSize(valueStr, contentWidth - 5);
        pdf.text(valueLines, contentX, currentY);
        currentY += valueLines.length * 4.5 + 8;
      });
      
      // Skills/Tags Section (decorative)
      if (currentY < pageHeight - 50) {
        currentY += 5;
        pdf.setFillColor(...lightGray);
        pdf.roundedRect(contentX, currentY - 4, contentWidth, 6, 1, 1, 'F');
        
        pdf.setTextColor(...primaryColor);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text('TAGS', contentX + 2, currentY);
        currentY += 12;
        
        // Sample tags based on answers
        const tags = ['Candidate', candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)];
        if (candidate.answers['f_exp']) {
          const exp = Number(candidate.answers['f_exp']);
          if (exp >= 5) tags.push('Senior');
          else if (exp >= 3) tags.push('Mid-Level');
          else tags.push('Junior');
        }
        
        let tagX = contentX;
        tags.forEach(tag => {
          const tagWidth = pdf.getTextWidth(tag) + 8;
          
          pdf.setFillColor(...primaryColor);
          pdf.roundedRect(tagX, currentY - 4, tagWidth, 8, 2, 2, 'F');
          
          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'bold');
          pdf.text(tag, tagX + 4, currentY + 1);
          
          tagX += tagWidth + 4;
        });
      }

      pdf.save(`${candidate.candidateName.replace(/\s+/g, '_')}_Resume.pdf`);
    } catch (error) {
      console.error('PDF Generation Error:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Navigation & Actions (Excluded from PDF) */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={onBack}
          className="flex items-center text-slate-500 hover:text-slate-800 transition-colors"
        >
          <Icons.Left size={18} className="mr-1" /> Back to List
        </button>
        
        <div className="flex gap-3">
          <button 
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-slate-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white"
          >
            {isGeneratingPdf ? <div className="animate-spin text-xs">⌛</div> : <Icons.Download size={18} />}
            {isGeneratingPdf ? 'Generating...' : 'Download PDF'}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 rounded-xl text-white font-medium hover:bg-primary-700 transition-colors shadow-sm shadow-primary-200">
            <Icons.Check size={18} />
            Hire Candidate
          </button>
        </div>
      </div>

      {/* Printable Area Wrapper */}
      <div ref={pdfRef} className="space-y-6">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <img 
              src={candidate.photoUrl} 
              alt={candidate.candidateName} 
              className="w-24 h-24 rounded-full object-cover border-4 border-gray-50 shadow-sm"
              crossOrigin="anonymous" // Important for html2canvas
            />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{candidate.candidateName}</h1>
              <p className="text-slate-500">{candidate.email}</p>
              <div className="flex items-center gap-3 mt-3">
                <span className="px-3 py-1 bg-gray-100 text-slate-600 rounded-full text-xs font-medium">{candidate.role}</span>
                <span className="px-3 py-1 bg-gray-100 text-slate-600 rounded-full text-xs font-medium">{candidate.answers['f_exp']} Years Exp</span>
              </div>
            </div>
          </div>
          {/* Controls removed from here to separate action bar above */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Col: Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* AI Summary Section */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-indigo-900 font-semibold">
                  <Icons.AI size={18} className="text-indigo-600" />
                  AI Executive Summary
                </div>
                {!summary && (
                  <button 
                    onClick={handleGenerateSummary}
                    disabled={loadingSummary}
                    className="text-xs bg-white/80 hover:bg-white text-indigo-600 px-3 py-1.5 rounded-lg border border-indigo-100 font-medium transition-all"
                    data-html2canvas-ignore="true"
                  >
                    {loadingSummary ? 'Generating...' : 'Generate with Gemini'}
                  </button>
                )}
              </div>
              {loadingSummary ? (
                  <div className="animate-pulse space-y-2">
                      <div className="h-2 bg-indigo-200 rounded w-3/4"></div>
                      <div className="h-2 bg-indigo-200 rounded w-full"></div>
                      <div className="h-2 bg-indigo-200 rounded w-5/6"></div>
                  </div>
              ) : (
                  <p className="text-sm text-indigo-800 leading-relaxed">
                  {summary || "Click generate to get an AI-powered summary of this candidate's fit for the role."}
                  </p>
              )}
            </div>

            {/* Application Data */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-slate-900">Application Answers</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {Object.entries(candidate.answers).map(([key, value]) => {
                  if (key === 'f_photo') return null; // Already shown
                  const label = key.replace('f_', '').replace(/_/g, ' ').toUpperCase(); 
                  return (
                    <div key={key} className="p-6 hover:bg-gray-50/50 transition-colors">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-2">
                        {label}
                      </label>
                      <div className="text-slate-800 text-sm leading-relaxed">
                        {String(value)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Col: Metadata */}
          <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="font-semibold text-slate-900 mb-4 text-sm uppercase tracking-wide">Status History</h3>
                  <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                      <TimelineItem 
                          date={new Date(candidate.submittedAt).toLocaleString()} 
                          title="Application Submitted" 
                          active={true}
                      />
                      <TimelineItem 
                          date="Pending" 
                          title="Under Review" 
                          active={candidate.status !== 'new'}
                      />
                  </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="font-semibold text-slate-900 mb-4 text-sm uppercase tracking-wide">Attachments</h3>
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50">
                      <div className="bg-red-100 text-red-600 p-2 rounded-lg">
                          <Icons.Forms size={18} />
                      </div>
                      <div>
                          <p className="text-sm font-medium text-slate-900">Resume.pdf</p>
                          <p className="text-xs text-slate-400">2.4 MB</p>
                      </div>
                  </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TimelineItem = ({ date, title, active }: { date: string, title: string, active: boolean }) => (
    <div className="relative pl-8">
        <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 ${active ? 'bg-primary-600 border-primary-600' : 'bg-white border-gray-300'}`}></div>
        <p className={`text-sm font-medium ${active ? 'text-slate-900' : 'text-slate-400'}`}>{title}</p>
        <p className="text-xs text-slate-400 mt-0.5">{date}</p>
    </div>
)

export default CandidateProfile;