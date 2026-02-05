
import React, { useState } from 'react';

const CRMGeneratorView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'python' | 'readme' | 'requirements'>('python');

  const pythonCode = `
import pandas as pd
import re
import os
import sys

# CRM Data Cleaner Pro
# --------------------------------------------------------------------------
# Features: Email Validation, Phone Normalization (UAE), Duplicate Detection
# --------------------------------------------------------------------------

def clean_crm_data(file_path):
    if not os.path.exists(file_path):
        print(f"Error: File {file_path} not found.")
        return

    print(f"[*] Loading data from {file_path}...")
    try:
        df = pd.read_csv(file_path)
    except Exception as e:
        print(f"Error reading CSV: {e}")
        return

    initial_count = len(df)
    print(f"[*] Initial records: {initial_count}")

    # 1. Normalize column names (lowercase and strip spaces)
    df.columns = [col.lower().strip() for col in df.columns]
    
    # Identify target columns
    email_col = 'email' if 'email' in df.columns else None
    phone_col = 'phone' if 'phone' in df.columns else None
    
    if not email_col and not phone_col:
        print("Error: Could not find 'email' or 'phone' columns in CSV.")
        return

    # To track removed rows
    removed_rows = []

    # 2. Email Validation
    if email_col:
        print("[*] Validating email formats...")
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        
        # Identify invalid emails
        invalid_mask = ~df[email_col].astype(str).str.match(email_regex, na=False)
        invalid_emails = df[invalid_mask].copy()
        invalid_emails['reason'] = 'Invalid Email Format'
        removed_rows.append(invalid_emails)
        
        # Keep only valid
        df = df[~invalid_mask]

    # 3. Phone Normalization (UAE Logic: 05 -> +9715)
    if phone_col:
        print("[*] Normalizing phone numbers...")
        def normalize_uae_phone(val):
            if pd.isna(val): return val
            # Remove spaces, dashes, parentheses
            clean = re.sub(r'[\s\-\(\)]', '', str(val))
            # UAE Specific: If starts with 05, replace with +9715
            if clean.startswith('05'):
                clean = '+9715' + clean[2:]
            elif clean.startswith('5') and len(clean) == 9:
                clean = '+971' + clean
            return clean

        df[phone_col] = df[phone_col].apply(normalize_uae_phone)

    # 4. Duplicate Detection
    print("[*] Checking for duplicates...")
    subset = []
    if email_col: subset.append(email_col)
    if phone_col: subset.append(phone_col)
    
    dup_mask = df.duplicated(subset=subset, keep='first')
    duplicates = df[dup_mask].copy()
    duplicates['reason'] = 'Duplicate Entry'
    removed_rows.append(duplicates)
    
    df = df[~dup_mask]

    # Finalize Reports
    final_count = len(df)
    print(f"[+] Cleaning complete. {final_count} records remain.")

    # Save Results
    base_name = os.path.splitext(file_path)[0]
    clean_file = f"clean_data.csv"
    report_file = f"removed_rows_report.csv"

    df.to_csv(clean_file, index=False)
    
    if removed_rows:
        report_df = pd.concat(removed_rows, ignore_index=True)
        report_df.to_csv(report_file, index=False)
        print(f"[+] Saved report of {len(report_df)} removed rows to {report_file}")
    
    print(f"[+] Saved cleaned data to {clean_file}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python crm_cleaner.py <path_to_csv_file>")
    else:
        clean_crm_data(sys.argv[1])
  `.trim();

  const readme = `
# CRM Data Cleaner: List Preparation Tool

Boost your sales efficiency by cleaning your lead lists before importing them into **HubSpot**, **Salesforce**, or **Pipedrive**. 

This script ensures your data is professional, formatted correctly for SMS/Email campaigns, and free of costly duplicates.

## Why use this?
- **Avoid Bounce Rates**: Removes invalid email addresses that damage your sender reputation.
- **SMS Ready**: Formats UAE mobile numbers to international standards (\`+971\`).
- **Clean CRM**: Prevents duplicate records which confuse sales teams and mess up reporting.

## Setup Instructions

1. **Install Python**: Ensure you have Python 3.8+ installed.
2. **Install Requirements**:
   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`
3. **Prepare your CSV**: Ensure your file has columns named exactly \`email\` or \`phone\`.

## How to Run

1. Open your terminal or command prompt.
2. Run the script:
   \`\`\`bash
   python crm_cleaner.py my_leads.csv
   \`\`\`

## Results
- **clean_data.csv**: Your polished, ready-to-import list.
- **removed_rows_report.csv**: A list of every record that was deleted, including the reason why (Invalid Email or Duplicate). Review this to see if you need to manually fix any important leads!
  `.trim();

  const requirements = `
pandas
openpyxl
  `.trim();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fade-in">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-gray-900">
          CRM Data Cleaner Generator
        </h1>
        <p className="mt-4 text-lg text-gray-500">
          Clean your lead lists for HubSpot and Salesforce. This generator provides 
          a local Python solution for high-volume data scrubbing.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="flex border-b bg-gray-50">
          <button
            onClick={() => setActiveTab('python')}
            className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'python' ? 'border-indigo-600 text-indigo-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            crm_cleaner.py
          </button>
          <button
            onClick={() => setActiveTab('readme')}
            className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'readme' ? 'border-indigo-600 text-indigo-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            README.md
          </button>
          <button
            onClick={() => setActiveTab('requirements')}
            className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'requirements' ? 'border-indigo-600 text-indigo-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            requirements.txt
          </button>
        </div>

        <div className="relative group">
          <pre className="p-6 bg-slate-900 text-slate-100 text-sm font-mono overflow-x-auto min-h-[400px]">
            {activeTab === 'python' ? pythonCode : activeTab === 'readme' ? readme : requirements}
          </pre>
          <button
            onClick={() => copyToClipboard(activeTab === 'python' ? pythonCode : activeTab === 'readme' ? readme : requirements)}
            className="absolute top-4 right-4 p-2 bg-slate-700 text-slate-300 rounded hover:bg-slate-600 transition-colors opacity-0 group-hover:opacity-100 flex items-center gap-2"
          >
            <i className="fas fa-copy"></i>
            <span className="text-xs">Copy Code</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-blue-50 rounded-xl border border-blue-100 flex gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg">
            <i className="fas fa-shield-alt text-xl"></i>
          </div>
          <div>
            <h4 className="font-bold text-blue-900 mb-1">Privacy First</h4>
            <p className="text-sm text-blue-700 leading-relaxed">Process sensitive customer data locally on your computer. Your CSV never touches any server or API.</p>
          </div>
        </div>
        <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-100 flex gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center text-white shadow-lg">
            <i className="fas fa-check-double text-xl"></i>
          </div>
          <div>
            <h4 className="font-bold text-emerald-900 mb-1">CRM Ready</h4>
            <p className="text-sm text-emerald-700 leading-relaxed">Strict phone normalization and email regex validation ensures your imports work perfectly on the first try.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CRMGeneratorView;
