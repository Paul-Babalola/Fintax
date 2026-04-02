"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, AlertTriangle, CheckCircle2, Info } from "lucide-react";

interface TaxFormData {
  taxpayer_name: string;
  tin: string;
  gross_income: number;
  taxable_income: number;
  tax_liability: number;
  wht_credit: number;
  net_tax_due: number;
  year: number;
}

interface FormGeneratorProps {
  taxData: TaxFormData;
}

export function TaxFormGenerator({ taxData }: FormGeneratorProps) {
  const [selectedForm, setSelectedForm] = useState<string>('PITFORM001');
  const [isGenerating, setIsGenerating] = useState(false);

  const forms = [
    {
      id: 'PITFORM001',
      name: 'Individual Return Form',
      description: 'Annual personal income tax return',
      deadline: 'March 31',
      status: 'ready'
    },
    {
      id: 'PITFORM002', 
      name: 'Self Assessment Return',
      description: 'For complex income sources',
      deadline: 'March 31',
      status: 'ready'
    },
    {
      id: 'VATFORM001',
      name: 'VAT Return',
      description: 'Monthly VAT return',
      deadline: '21st of following month',
      status: 'coming_soon'
    }
  ];

  const generateForm = async () => {
    setIsGenerating(true);
    
    try {
      // Simulate form generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, this would:
      // 1. Generate a PDF form with pre-filled data
      // 2. Create XML file for electronic submission
      // 3. Provide step-by-step filing instructions
      
      // For now, simulate download
      const formContent = generateFormContent(selectedForm, taxData);
      downloadTextFile(`${selectedForm}_${taxData.year}.txt`, formContent);
      
    } catch (error) {
      console.error('Error generating form:', error);
      alert('Failed to generate form. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Tax Form Generation
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Generate pre-filled tax forms ready for manual submission to FIRS.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Important Notice */}
          <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-medium text-amber-900">Manual Filing Required</h4>
                <p className="text-sm text-amber-700 mt-1">
                  Currently, forms are generated for manual review and submission. 
                  Direct e-filing integration is planned for future releases.
                </p>
              </div>
            </div>
          </div>

          {/* Form Selection */}
          <div className="space-y-4">
            <h3 className="font-medium">Available Tax Forms</h3>
            <div className="grid gap-3">
              {forms.map((form) => (
                <div 
                  key={form.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedForm === form.id 
                      ? 'border-[#1A6B4A] bg-[#1A6B4A]/5' 
                      : 'border-gray-200 hover:border-gray-300'
                  } ${form.status === 'coming_soon' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => form.status === 'ready' && setSelectedForm(form.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{form.name}</h4>
                        <Badge 
                          variant={form.status === 'ready' ? 'default' : 'secondary'}
                          className={form.status === 'ready' ? 'bg-[#1A6B4A]' : ''}
                        >
                          {form.status === 'ready' ? 'Available' : 'Coming Soon'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{form.description}</p>
                      <p className="text-xs text-muted-foreground">
                        Deadline: {form.deadline}
                      </p>
                    </div>
                    {selectedForm === form.id && (
                      <CheckCircle2 className="h-5 w-5 text-[#1A6B4A]" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tax Data Summary */}
          <div className="space-y-3">
            <h3 className="font-medium">Tax Calculation Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground">Gross Income</p>
                <p className="font-medium">₦{taxData.gross_income.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Taxable Income</p>
                <p className="font-medium">₦{taxData.taxable_income.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">WHT Credit</p>
                <p className="font-medium">₦{taxData.wht_credit.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Net Tax Due</p>
                <p className="font-semibold">₦{taxData.net_tax_due.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <Button 
            onClick={generateForm}
            disabled={isGenerating || !selectedForm}
            className="w-full bg-[#1A6B4A] hover:bg-[#145a3d]"
          >
            {isGenerating ? (
              <>Generating Form...</>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Generate {forms.find(f => f.id === selectedForm)?.name}
              </>
            )}
          </Button>

          {/* Instructions */}
          <div className="rounded-lg border p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
              <div className="space-y-2">
                <h4 className="font-medium">Filing Instructions</h4>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Download and review the generated form carefully</li>
                  <li>Gather required supporting documents</li>
                  <li>Print the form or save as PDF for submission</li>
                  <li>Submit to FIRS through their online portal or physically</li>
                  <li>Keep copies for your records</li>
                </ol>
                <p className="text-xs text-muted-foreground mt-3">
                  <strong>Note:</strong> Always verify calculations and consult a tax professional for complex situations.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function generateFormContent(formId: string, taxData: TaxFormData): string {
  const currentDate = new Date().toLocaleDateString();
  
  return `
FEDERAL INLAND REVENUE SERVICE
${formId} - TAX RETURN FORM
Generated on: ${currentDate}

=====================================
TAXPAYER INFORMATION
=====================================
Name: ${taxData.taxpayer_name}
TIN: ${taxData.tin}
Tax Year: ${taxData.year}

=====================================
INCOME DETAILS
=====================================
Gross Income: ₦${taxData.gross_income.toLocaleString()}
Taxable Income: ₦${taxData.taxable_income.toLocaleString()}

=====================================
TAX CALCULATION
=====================================
Tax Liability: ₦${taxData.tax_liability.toLocaleString()}
WHT Credit: ₦${taxData.wht_credit.toLocaleString()}
Net Tax Due: ₦${taxData.net_tax_due.toLocaleString()}

=====================================
SUBMISSION INSTRUCTIONS
=====================================
1. Review all calculations carefully
2. Attach required supporting documents
3. Submit to FIRS portal or nearest tax office
4. Pay any outstanding tax liability
5. Retain copy for your records

=====================================
DISCLAIMER
=====================================
This form is computer-generated based on your income and expense data.
Please verify all information before submission.
Consult a tax professional for complex tax situations.

Generated by FinTax - Nigerian Tax Management Platform
  `;
}

function downloadTextFile(filename: string, content: string) {
  const element = document.createElement('a');
  const file = new Blob([content], { type: 'text/plain' });
  element.href = URL.createObjectURL(file);
  element.download = filename;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}