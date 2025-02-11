import json

# Read the original JSON file
with open('Fixed_Test_Set.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Create a set to track unique entries
unique_entries = set()
unique_data = []

# Iterate through the data and keep only unique entries
for entry in data:
    # Create a hashable representation of the entry
    entry_tuple = (
        entry['intent'], 
        entry['language'], 
        entry['text'], 
        tuple(tuple(sorted(entity.items())) for entity in entry.get('entities', []))
    )
    
    # Add to unique data if not seen before
    if entry_tuple not in unique_entries:
        unique_entries.add(entry_tuple)
        unique_data.append(entry)

# Write the unique entries back to the file
with open('Fixed_Test_Set.json', 'w', encoding='utf-8') as f:
    json.dump(unique_data, f, indent=2, ensure_ascii=False)

print(f"Original entries: {len(data)}")
print(f"Unique entries: {len(unique_data)}")
print(f"Removed {len(data) - len(unique_data)} duplicate entries")
