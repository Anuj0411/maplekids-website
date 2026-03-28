#!/bin/bash

echo "🔍 Checking Firebase Functions Configuration..."
echo ""

# Check Firebase config (production)
echo "📦 Production Config (Firebase):"
firebase functions:config:get 2>/dev/null || echo "⚠️  Not logged in or no config set"

echo ""
echo "💻 Local Config (.env file):"
if [ -f "functions/.env" ]; then
    echo "✅ .env file exists"
    echo "Contents (masked):"
    sed 's/=.*/=***HIDDEN***/' functions/.env
else
    echo "❌ .env file not found"
    echo "Create it with: cd functions && cat > .env"
fi

echo ""
echo "🔒 Security Check:"
if grep -q "^\.env$" functions/.gitignore 2>/dev/null; then
    echo "✅ .env is in .gitignore (safe)"
else
    echo "⚠️  .env is NOT in .gitignore! Add it to prevent leaking secrets!"
fi

echo ""
echo "📁 Functions Build Status:"
if [ -d "functions/lib" ]; then
    echo "✅ Functions compiled (lib/ directory exists)"
else
    echo "⚠️  Functions not compiled yet. Run: cd functions && npm run build"
fi

echo ""
echo "🚀 Deployment Status:"
echo "Last deployed functions:"
firebase functions:list 2>/dev/null | grep whatsappWebhook || echo "⚠️  whatsappWebhook not deployed yet"

echo ""
echo "Done! 🎉"
