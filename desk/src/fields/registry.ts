import type { FieldType } from '@/types'

// Component registry for field types
export const fieldComponentMap: Record<FieldType, string> = {
  'Data': 'TextField',
  'Link': 'LinkField',
  'Select': 'SelectField',
  'Attach': 'AttachField',
  'Currency': 'FloatField',
  'Date': 'DateField',
  'Datetime': 'DateTimeField',
  'Time': 'TimeField',
  'Float': 'FloatField',
  'Int': 'IntField',
  'Percent': 'FloatField',
  'Duration': 'TextField',
  'Check': 'CheckField',
  'Small Text': 'TextAreaField',
  'Long Text': 'TextAreaField',
  'Text Editor': 'TextEditorField',
  'Code': 'TextAreaField',
  'Rating': 'TextField',
  'Color': 'ColorField',
  'Barcode': 'TextField',
  'Signature': 'TextField',
  'GeoData': 'TextField',
  'JSON': 'TextAreaField',
  'Table': 'ChildTableField',
  'Table MultiSelect': 'ChildTableField',
  'HTML': 'TextField',
  'Image': 'AttachField',
  'Heading': 'HeadingField',
  'Column Break': 'ColumnBreakField',
  'Section Break': 'SectionBreakField',
  'Tab Break': 'TabBreakField'
}

// Layout field types that don't render as editable fields
export const layoutFieldTypes = [
  'Section Break',
  'Column Break', 
  'Tab Break',
  'Heading',
  'HTML'
]

// Check if a field type is a layout/structural field
export function isLayoutField(fieldtype: FieldType): boolean {
  return layoutFieldTypes.includes(fieldtype)
}

export function getFieldComponent(fieldtype: FieldType): string {
  return fieldComponentMap[fieldtype] || 'TextField'
}
