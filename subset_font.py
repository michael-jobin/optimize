import os
import hashlib
from fontTools.ttLib import TTFont
import subprocess
import glob

def chunker(seq, size):
    return (seq[pos:pos + size] for pos in range(0, len(seq), size))

def generate_hash():
    return hashlib.md5(os.urandom(32)).hexdigest()

# Font name variable
font_name = 'regular'

# Path to your font file
font_path = f'./fonts/input/{font_name}.woff2'

# Open the font file
font = TTFont(font_path)

# Get the Unicode cmap table
cmap = font.getBestCmap()

# Convert cmap keys to a sorted list of Unicode code points
unicodes = sorted(cmap.keys())

# Divide the list into chunks of 50
unicode_chunks = list(chunker(unicodes, 50))

output_base_path = './fonts/output/'
css_content = []  # List to store CSS content for each subset

# Ensure the base output directory exists
os.makedirs(output_base_path, exist_ok=True)

for chunk in unicode_chunks:
    # Generate a whitelist string for the chunk
    whitelist = ','.join(f"U+{cp:04X}" for cp in chunk)
    temp_output_path = os.path.join(output_base_path, f"temp_segment")
    os.makedirs(temp_output_path, exist_ok=True)  # Make sure this directory exists
    
    command = f"glyphhanger --whitelist={whitelist} --subset={font_path} --formats=woff2,woff --css --family='{font_name}' --output={temp_output_path}"
    
    # Execute the command
    subprocess.run(command, shell=True, check=True)
    
    # Generate unique hash for this chunk
    unique_hash = generate_hash()
    
    # Rename the output files to the desired naming scheme and read CSS
    for format_ext in ('woff', 'woff2'):
        generated_files = glob.glob(os.path.join(temp_output_path, f"*.{format_ext}"))
        for generated_file in generated_files:
            new_filename = f"{font_name}-{unique_hash}.{format_ext}"
            os.rename(generated_file, os.path.join(output_base_path, new_filename))
    
    # Corrected CSS file name
    css_file_name = f"{font_name}.css"
    css_file_path = os.path.join(temp_output_path, css_file_name)
    
    # Read, modify, and store the CSS content
    with open(css_file_path, 'r') as css_file:
        css = css_file.read()
        # Modify the paths in the CSS content
        modified_css = css.replace(f"fonts/output/temp_segment/{font_name}-subset", f"{font_name}/{font_name}-{unique_hash}")
        css_content.append(modified_css)
    
    # Cleanup: Remove the temporary directory and its contents
    for file in os.listdir(temp_output_path):
        os.remove(os.path.join(temp_output_path, file))
    os.rmdir(temp_output_path)

# Write the combined CSS content to a single file
with open(os.path.join(output_base_path, f'{font_name}.css'), 'w') as combined_css_file:
    combined_css_file.write("\n".join(css_content))

font.close()
