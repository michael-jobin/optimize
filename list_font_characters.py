from fontTools.ttLib import TTFont

# Path to your font file
font_path = './fonts/input/LINESeedJP_OTF_Th.woff2'

# Open the font file
font = TTFont(font_path)

# Get the Unicode cmap table
cmap = font.getBestCmap()

# Initialize a counter
unicode_count = 0

# Print the unicode characters
for code_point in cmap:
    print(f"U+{code_point:04X}", end=', ')
    unicode_count += 1

# Print the total number of unicode characters
print(f"\nThere are {unicode_count} Unicodes")

font.close()

