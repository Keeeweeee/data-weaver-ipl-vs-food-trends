# Contributing to The Data Weaver

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Getting Started

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/the-data-weaver.git
   cd the-data-weaver
   ```
3. **Install dependencies**
   ```bash
   npm install
   ```
4. **Set up environment**
   ```bash
   cp .env.example .env
   # Add your CricAPI key
   ```
5. **Start development server**
   ```bash
   npm start
   ```

## Development Workflow

### Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring

Example: `feature/add-team-filter`

### Commit Messages

Follow conventional commits:

```
type(scope): description

[optional body]
[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

Examples:
```
feat(api): add caching for CricAPI responses
fix(charts): resolve timeline chart rendering issue
docs(readme): update setup instructions
```

## Code Standards

### JavaScript

- Use ES6+ features
- Follow existing code style
- Add comments for complex logic
- Use descriptive variable names

### Error Handling

Always implement comprehensive error handling:

```javascript
try {
    const data = await fetchAPI();
    return processData(data);
} catch (error) {
    console.error('❌ Error:', error.message);
    return fallbackData();
}
```

### API Integration

- Always use safe property access
- Implement fallbacks
- Log comprehensively
- Handle rate limiting

See `.kiro/steering/api-guidelines.md` for details.

## Testing

### Manual Testing Checklist

- [ ] Server starts without errors
- [ ] Dashboard loads correctly
- [ ] Charts render with data
- [ ] API fallbacks work
- [ ] Responsive on mobile
- [ ] No console errors

### API Testing

```bash
# Health check
curl http://localhost:3000/api/health

# Cricket API
curl http://localhost:3000/api/cricket/matches

# Trends API
curl http://localhost:3000/api/trends/interest
```

## Pull Request Process

1. **Update documentation** if needed
2. **Test thoroughly** - all features must work
3. **Follow code standards** - match existing style
4. **Write clear PR description**:
   - What changed
   - Why it changed
   - How to test it

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring

## Testing
How to test these changes

## Checklist
- [ ] Code follows project standards
- [ ] Documentation updated
- [ ] Tested locally
- [ ] No breaking changes
```

## Areas for Contribution

### High Priority

- [ ] Add caching for API responses
- [ ] Implement more data sources
- [ ] Add user filters (team, date range)
- [ ] Improve mobile responsiveness
- [ ] Add data export feature

### Medium Priority

- [ ] Add more visualizations
- [ ] Implement dark mode
- [ ] Add loading animations
- [ ] Improve error messages
- [ ] Add keyboard shortcuts

### Low Priority

- [ ] Add unit tests
- [ ] Improve accessibility
- [ ] Add internationalization
- [ ] Create Docker setup
- [ ] Add CI/CD pipeline

## Documentation

When adding features:

1. Update README.md if needed
2. Add to API-GUIDE.md for API changes
3. Update SETUP.md for setup changes
4. Add to TROUBLESHOOTING.md for common issues

## Questions?

- Open an issue for discussion
- Check existing documentation
- Review steering files in `.kiro/steering/`

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn
- Focus on the code, not the person

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to The Data Weaver! 🎉
