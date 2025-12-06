# Skills Section - Developer Quick Reference

## API Response Format

### Old Format (Deprecated)
```json
"skills": [
  {
    "title": "Java",
    "level": "Expert"
  },
  {
    "title": "Spring Boot",
    "level": "Advanced"
  }
]
```

### New Format (Current)
```json
"skills": {
  "languages": ["Java", "JavaScript", "Python"],
  "frameworks": ["Spring Boot", "React", "Node.js"],
  "databases": ["MySQL", "PostgreSQL", "MongoDB"],
  "tools": ["Git", "Docker", "Maven"],
  "cloud": ["AWS", "Azure"],
  "other": ["RESTful APIs", "Microservices", "CI/CD"]
}
```

## Template Placeholders

### Conditional Sections
```latex
{{#HAS_SKILLS}}
  <!-- Skills section content -->
{{/HAS_SKILLS}}

{{#SKILL_LANGUAGES}}
  \textbf{Languages:} {{SKILL_LANGUAGES}}
{{/SKILL_LANGUAGES}}
```

### Available Placeholders
- `{{#HAS_SKILLS}}` - Entire skills section wrapper
- `{{#SKILL_LANGUAGES}}` - Programming languages category
- `{{#SKILL_FRAMEWORKS}}` - Frameworks & libraries category
- `{{#SKILL_DATABASES}}` - Databases category
- `{{#SKILL_TOOLS}}` - Tools & technologies category
- `{{#SKILL_CLOUD}}` - Cloud platforms category
- `{{#SKILL_OTHER}}` - Other skills category

### Placeholder Values
- `{{SKILL_LANGUAGES}}` - Comma-separated list of languages
- `{{SKILL_FRAMEWORKS}}` - Comma-separated list of frameworks
- `{{SKILL_DATABASES}}` - Comma-separated list of databases
- `{{SKILL_TOOLS}}` - Comma-separated list of tools
- `{{SKILL_CLOUD}}` - Comma-separated list of cloud platforms
- `{{SKILL_OTHER}}` - Comma-separated list of other skills

## Backend Processing Flow

```
1. Extract skills object from resumeData
   ↓
2. Check if skills object exists and has content
   ↓
3. For each category (languages, frameworks, etc.):
   a. Extract array of skills
   b. Check if array has content
   c. Join skills with ", "
   d. Escape LaTeX special characters
   e. Replace placeholder in template
   ↓
4. Remove empty category sections
   ↓
5. Return processed template
```

## Java Code Reference

### Extracting Skills Object
```java
Map<String, Object> skills = getMapValue(resumeData, "skills");
```

### Processing a Category
```java
List<String> categorySkills = getStringListValue(skills, "languages");
if (categorySkills != null && !categorySkills.isEmpty()) {
    String skillsString = escapeLatexSpecialChars(String.join(", ", categorySkills));
    template = template.replace("{{SKILL_LANGUAGES}}", skillsString);
}
```

### Helper Methods
```java
// Get string list from map
private List<String> getStringListValue(Map<String, Object> map, String key)

// Handle individual skill category
private String handleSkillCategory(String template, Map<String, Object> skills, 
                                   String category, String placeholder)

// Main skills section handler
private String handleSkillsSection(String template, Map<String, Object> resumeData)
```

## Testing Checklist

### Unit Tests
- [ ] Test with all categories filled
- [ ] Test with some categories empty
- [ ] Test with all categories empty
- [ ] Test with special characters in skills
- [ ] Test with very long skill lists
- [ ] Test with single skill per category

### Integration Tests
- [ ] Test JSON parsing from AI response
- [ ] Test LaTeX template population
- [ ] Test PDF generation
- [ ] Test all four templates (ATS, Modern, Professional, Creative)

### Edge Cases
- [ ] Skills object is null
- [ ] Skills object is empty {}
- [ ] Category arrays are null
- [ ] Category arrays are empty []
- [ ] Skills contain LaTeX special characters (&, %, $, #, _, {, }, ~, ^, \)

## Common Issues & Solutions

### Issue: Skills not appearing in PDF
**Solution**: Check if skills object exists and has at least one non-empty category

### Issue: LaTeX compilation error
**Solution**: Verify all special characters are properly escaped using `escapeLatexSpecialChars()`

### Issue: Empty skill categories showing
**Solution**: Ensure `removeSection()` is called for empty categories

### Issue: Skills appearing as [object Object]
**Solution**: Use `getStringListValue()` instead of `getListValue()` for skill arrays

## Adding New Skill Categories

### 1. Update resume_prompt.txt
```json
"skills": {
  "languages": [...],
  "frameworks": [...],
  "newCategory": ["skill1", "skill2"]  // Add here
}
```

### 2. Update LaTeX templates
```latex
{{#SKILL_NEWCATEGORY}}
\textbf{New Category:} {{SKILL_NEWCATEGORY}}
{{/SKILL_NEWCATEGORY}}
```

### 3. Update LatexServiceImpl.java
```java
// In handleSkillsSection()
template = handleSkillCategory(template, skills, "newCategory", "SKILL_NEWCATEGORY");

// In hasAnySkills check
List<String> categories = Arrays.asList("languages", "frameworks", "databases", 
                                        "tools", "cloud", "other", "newCategory");
```

## Performance Considerations

- Skill list joining is O(n) where n is number of skills
- Each category is processed independently
- Empty categories are removed early to save processing
- LaTeX escaping is done once per skill string

## Migration Guide

### For Existing Resumes
1. Old format resumes will not work with new system
2. Users must regenerate resumes using AI
3. AI will automatically convert descriptions to new format
4. No data migration needed (generate fresh)

### For API Consumers
1. Update request/response DTOs to new skills format
2. Update frontend to display categorized skills
3. Update any skill editing interfaces
4. Test with various skill combinations

---

**Version**: 1.0  
**Last Updated**: December 4, 2025  
**Contact**: See project README for support
