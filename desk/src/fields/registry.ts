import type { FieldType } from '@/types'

// Component registry for field types
export const fieldComponentMap: Record<FieldType, string> = {
  'Data': 'TextField',
  'Link': 'LinkField',
  'Select': 'SelectField',
  'Attach': 'AttachField',
  'Currency': 'FloatField',
  'Date': 'DateField',
  'DateTime': 'DateTimeField',
  'Time': 'TimeField',
  'Float': 'FloatField',
  'Int': 'IntField',
  'Percent': 'FloatField',
  'Duration': 'TextField',
  'Check': 'CheckField',
  'Small Text': 'TextAreaField',
  'Long Text': 'TextAreaField',
  'Text Editor': 'TextAreaField',
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
  'Column Break': 'TextField',
  'Section Break': 'SectionBreakField'
}

export function getFieldComponent(fieldtype: FieldType): string {
  return fieldComponentMap[fieldtype] || 'TextField'
}
