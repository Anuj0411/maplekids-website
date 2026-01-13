#!/bin/bash

# Script to update all relative imports to use path aliases
# Run from project root: bash update-imports.sh

echo "🔧 Updating imports to use path aliases..."

# Update firebase imports
find src -name "*.tsx" -o -name "*.ts" | while read file; do
  sed -i '' "s|from '../../../firebase/services'|from '@/firebase/services'|g" "$file"
  sed -i '' "s|from '../../../firebase/config'|from '@/firebase/config'|g" "$file"
  sed -i '' "s|from '../../../../firebase/services'|from '@/firebase/services'|g" "$file"
  sed -i '' "s|from '../../../../firebase/config'|from '@/firebase/config'|g" "$file"
done

# Update component imports
find src -name "*.tsx" -o -name "*.ts" | while read file; do
  sed -i '' "s|from '../../../components/common'|from '@/components/common'|g" "$file"
  sed -i '' "s|from '../../../components/common/|from '@/components/common/|g" "$file"
  sed -i '' "s|from '../../../../components/common'|from '@/components/common'|g" "$file"
  sed -i '' "s|from '../../../../components/common/|from '@/components/common/|g" "$file"
done

# Update i18n imports
find src -name "*.tsx" -o -name "*.ts" | while read file; do
  sed -i '' "s|from '../../../i18n'|from '@/i18n'|g" "$file"
  sed -i '' "s|from '../../../../i18n'|from '@/i18n'|g" "$file"
done

# Update feature imports (more complex - need to preserve feature name)
find src -name "*.tsx" -o -name "*.ts" | while read file; do
  # Attendance
  sed -i '' "s|from '../../../attendance/components/|from '@/features/attendance/components/|g" "$file"
  sed -i '' "s|from '../../attendance/components/|from '@/features/attendance/components/|g" "$file"
  
  # Students
  sed -i '' "s|from '../../../students/components/|from '@/features/students/components/|g" "$file"
  sed -i '' "s|from '../../students/components/|from '@/features/students/components/|g" "$file"
  
  # Reports
  sed -i '' "s|from '../../../reports/components/|from '@/features/reports/components/|g" "$file"
  sed -i '' "s|from '../../reports/components/|from '@/features/reports/components/|g" "$file"
  
  # Announcements
  sed -i '' "s|from '../../../announcements/components/|from '@/features/announcements/components/|g" "$file"
  sed -i '' "s|from '../../../announcements/services/|from '@/features/announcements/services/|g" "$file"
  
  # Auth
  sed -i '' "s|from '../../../auth/AuthContext'|from '@/features/auth/AuthContext'|g" "$file"
  sed -i '' "s|from '../../auth/AuthContext'|from '@/features/auth/AuthContext'|g" "$file"
done

# Update styles imports
find src -name "*.tsx" -o -name "*.ts" | while read file; do
  sed -i '' "s|from '../../../styles/|from '@/styles/|g" "$file"
  sed -i '' "s|from '../../../../styles/|from '@/styles/|g" "$file"
  sed -i '' "s|import '../../../styles/|import '@/styles/|g" "$file"
  sed -i '' "s|import '../../../../styles/|import '@/styles/|g" "$file"
done

echo "✅ Import update complete!"
echo "📝 Please review changes and test the application"
