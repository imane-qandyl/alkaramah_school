#!/bin/bash
# Setup alias for easy chatbot server startup

echo "🔧 Setting up TeachSmart chatbot server alias..."

# Get the current directory
CURRENT_DIR=$(pwd)

# Create alias command
ALIAS_COMMAND="alias start-teachsmart='cd \"$CURRENT_DIR\" && ./start-chatbot.sh'"

echo ""
echo "📝 Add this alias to your shell profile:"
echo ""
echo "$ALIAS_COMMAND"
echo ""

# Detect shell and suggest profile file
if [[ $SHELL == *"zsh"* ]]; then
    PROFILE_FILE="~/.zshrc"
elif [[ $SHELL == *"bash"* ]]; then
    PROFILE_FILE="~/.bashrc"
else
    PROFILE_FILE="~/.profile"
fi

echo "💡 To add it automatically to your $PROFILE_FILE:"
echo "   echo '$ALIAS_COMMAND' >> $PROFILE_FILE"
echo "   source $PROFILE_FILE"
echo ""
echo "🚀 After adding the alias, you can start the server from anywhere with:"
echo "   start-teachsmart"
echo ""

# Ask if user wants to add it automatically
read -p "Would you like to add this alias to your $PROFILE_FILE now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "$ALIAS_COMMAND" >> "$HOME/.zshrc" 2>/dev/null || echo "$ALIAS_COMMAND" >> "$HOME/.bashrc" 2>/dev/null || echo "$ALIAS_COMMAND" >> "$HOME/.profile"
    echo "✅ Alias added! Run 'source $PROFILE_FILE' or restart your terminal."
    echo "🚀 Then you can use: start-teachsmart"
else
    echo "👍 No problem! You can add it manually later if you want."
fi