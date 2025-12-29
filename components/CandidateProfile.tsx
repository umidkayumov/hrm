import React, { useState, useRef } from 'react';
import { Submission } from '../types';
import { Icons } from './Icons';
import { summarizeCandidate } from '../services/geminiService';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
    if (!pdfRef.current) return;
    setIsGeneratingPdf(true);

    try {
      const element = pdfRef.current;
      const canvas = await html2canvas(element, {
        scale: 2, // Improve resolution
        useCORS: true, // Allow loading cross-origin images (like picsum)
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Calculate height in pdf units ensuring aspect ratio
      const imgHeightInPdf = (imgHeight * pdfWidth) / imgWidth;
      
      let heightLeft = imgHeightInPdf;
      let position = 0;

      // First page
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightInPdf);
      heightLeft -= pdfHeight;

      // Additional pages if content is long
      while (heightLeft >= 0) {
        position = heightLeft - imgHeightInPdf;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightInPdf);
        heightLeft -= pdfHeight;
      }

      pdf.save(`${candidate.candidateName.replace(/\s+/g, '_')}_Profile.pdf`);
    } catch (error) {
      console.error('PDF Generation Error:', error);
      alert('Failed to generate PDF. Please ensure all images are loaded and try again.');
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