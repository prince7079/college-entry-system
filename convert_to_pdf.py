#!/usr/bin/env python3
"""Convert Markdown to PDF using WeasyPrint"""

import sys
import os

# Try to import required packages
try:
    import markdown
    from weasyprint import HTML
except ImportError:
    print("Installing required packages...")
    os.system("pip install markdown weasyprint")
    import markdown
    from weasyprint import HTML

def convert_md_to_pdf(input_file, output_file):
    """Convert Markdown file to PDF"""
    
    # Read the markdown file
    with open(input_file, 'r', encoding='utf-8') as f:
        md_content = f.read()
    
    # Convert markdown to HTML
    html_content = markdown.markdown(md_content, extensions=['extra', 'codehilite'])
    
    # Wrap in a basic HTML template
    full_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Project Synopsis</title>
        <style>
            @page {{ margin: 2cm; size: A4; }}
            body {{
                font-family: 'Helvetica', 'Arial', sans-serif;
                font-size: 12pt;
                line-height: 1.5;
                color: #333;
            }}
            h1 {{
                color: #1e293b;
                font-size: 24pt;
                border-bottom: 2px solid #2563eb;
                padding-bottom: 10px;
                text-align: center;
            }}
            h2 {{
                color: #2563eb;
                font-size: 16pt;
                margin-top: 20px;
            }}
            h3 {{
                color: #475569;
                font-size: 14pt;
            }}
            table {{
                width: 100%;
                border-collapse: collapse;
                margin: 15px 0;
            }}
            th, td {{
                border: 1px solid #e2e8f0;
                padding: 8px;
                text-align: left;
            }}
            th {{
                background-color: #f1f5f9;
            }}
            code {{
                background-color: #f1f5f9;
                padding: 2px 6px;
                border-radius: 3px;
                font-family: 'Courier New', monospace;
            }}
            pre {{
                background-color: #f1f5f9;
                padding: 15px;
                border-radius: 5px;
                overflow-x: auto;
            }}
            ul, ol {{
                margin-left: 20px;
            }}
            li {{
                margin-bottom: 5px;
            }}
        </style>
    </head>
    <body>
        {html_content}
    </body>
    </html>
    """
    
    # Convert HTML to PDF
    HTML(string=full_html).write_pdf(output_file)
    print(f"Successfully converted {input_file} to {output_file}")

if __name__ == "__main__":
    input_file = "PROJECT_SYNOPSIS.md"
    output_file = "PROJECT_SYNOPSIS.pdf"
    
    if len(sys.argv) > 1:
        input_file = sys.argv[1]
    if len(sys.argv) > 2:
        output_file = sys.argv[2]
    
    convert_md_to_pdf(input_file, output_file)

