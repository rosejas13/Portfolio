import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Markdown } from '../markdown'

describe('Markdown', () => {
  describe('inline formatting', () => {
    it('renders bold text', () => {
      render(<Markdown content="hello **world**" />)
      const strong = screen.getByText('world')
      expect(strong.tagName).toBe('STRONG')
    })

    it('renders inline code', () => {
      render(<Markdown content="use `code` here" />)
      const code = screen.getByText('code')
      expect(code.tagName).toBe('CODE')
    })

    it('renders safe links', () => {
      render(<Markdown content="[click](https://example.com)" />)
      const link = screen.getByText('click')
      expect(link.tagName).toBe('A')
      expect(link).toHaveAttribute('href', 'https://example.com')
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('blocks javascript: URLs', () => {
      render(<Markdown content="[xss](javascript:alert(1))" />)
      const link = screen.getByText('xss')
      expect(link).toHaveAttribute('href', '#')
    })

    it('allows relative URLs', () => {
      render(<Markdown content="[about](/about)" />)
      expect(screen.getByText('about')).toHaveAttribute('href', '/about')
    })

    it('allows hash anchor URLs', () => {
      render(<Markdown content="[section](#intro)" />)
      expect(screen.getByText('section')).toHaveAttribute('href', '#intro')
    })

    it('allows mailto: URLs', () => {
      render(<Markdown content="[email](mailto:test@example.com)" />)
      expect(screen.getByText('email')).toHaveAttribute('href', 'mailto:test@example.com')
    })

    it('escapes HTML in content', () => {
      render(<Markdown content="<script>alert(1)</script>" />)
      expect(screen.queryByText('alert(1)')).not.toBeInTheDocument()
      expect(document.body.innerHTML).not.toContain('<script>')
    })

    it('escapes HTML in link text', () => {
      render(<Markdown content='[<b>test</b>](https://example.com)' />)
      const link = screen.getByText(/test/)
      expect(link.innerHTML).not.toContain('<b>')
    })
  })

  describe('code blocks', () => {
    it('renders code blocks', () => {
      render(<Markdown content={'```js\nconst x = 1\n```'} />)
      const code = screen.getByText('const x = 1')
      expect(code.tagName).toBe('CODE')
    })

    it('escapes HTML inside code blocks', () => {
      render(<Markdown content={'```html\n<script>alert(1)</script>\n```'} />)
      const code = screen.getByText(/alert/)
      expect(code.innerHTML).not.toContain('<script>')
    })

    it('renders body text before and after code blocks', () => {
      render(<Markdown content={'hello\n```\ncode\n```\nworld'} />)
      expect(screen.getByText('hello')).toBeInTheDocument()
      expect(screen.getByText('code')).toBeInTheDocument()
      expect(screen.getByText('world')).toBeInTheDocument()
    })
  })

  describe('headings', () => {
    it('renders h2', () => {
      render(<Markdown content={'## Section'} />)
      const heading = screen.getByText('Section')
      expect(heading.tagName).toBe('H2')
    })

    it('renders h3', () => {
      render(<Markdown content={'### Subsection'} />)
      const heading = screen.getByText('Subsection')
      expect(heading.tagName).toBe('H3')
    })
  })

  describe('lists', () => {
    it('renders unordered list', () => {
      render(<Markdown content={'- item one\n- item two'} />)
      expect(screen.getByText('item one')).toBeInTheDocument()
      expect(screen.getByText('item two')).toBeInTheDocument()
    })

    it('renders ordered list', () => {
      render(<Markdown content={'1. first\n2. second'} />)
      expect(screen.getByText('first')).toBeInTheDocument()
      expect(screen.getByText('second')).toBeInTheDocument()
    })

    it('handles mixed list types', () => {
      render(<Markdown content={'- ul item\n\n1. ol item'} />)
      expect(screen.getByText('ul item')).toBeInTheDocument()
      expect(screen.getByText('ol item')).toBeInTheDocument()
    })
  })

  describe('blockquotes', () => {
    it('renders blockquote', () => {
      render(<Markdown content={'> cite this'} />)
      const blockquote = screen.getByText('cite this')
      expect(blockquote.tagName).toBe('BLOCKQUOTE')
    })
  })

  describe('paragraphs', () => {
    it('wraps plain text in paragraphs', () => {
      render(<Markdown content={'just a paragraph'} />)
      const p = screen.getByText('just a paragraph')
      expect(p.tagName).toBe('P')
    })

    it('separates paragraphs by blank lines', () => {
      render(<Markdown content={'para one\n\npara two'} />)
      expect(screen.getByText('para one')).toBeInTheDocument()
      expect(screen.getByText('para two')).toBeInTheDocument()
    })
  })

  describe('mixed content', () => {
    it('renders headings with inline formatting', () => {
      render(<Markdown content={'## **Bold** heading'} />)
      const strong = screen.getByText('Bold')
      expect(strong.tagName).toBe('STRONG')
      expect(strong.closest('h2')).toBeTruthy()
    })

    it('renders list items with links', () => {
      render(<Markdown content={'- [link](https://x.com)'} />)
      expect(screen.getByText('link')).toHaveAttribute('href', 'https://x.com')
    })
  })

  describe('className prop', () => {
    it('applies className to wrapper', () => {
      const { container } = render(<Markdown content="hello" className="my-class" />)
      expect(container.firstChild).toHaveClass('my-class')
    })
  })

  describe('empty content', () => {
    it('renders nothing for empty string', () => {
      const { container } = render(<Markdown content="" />)
      expect(container.firstChild).toBeEmptyDOMElement()
    })
  })

  describe('XSS prevention', () => {
    it('blocks javascript: in URLs with mixed case', () => {
      render(<Markdown content={'[xss](JavaScript:alert(1))'} />)
      expect(screen.getByText('xss')).toHaveAttribute('href', '#')
    })

    it('blocks data: URLs', () => {
      render(<Markdown content={'[xss](data:text/html,<script>alert(1)</script>)}'} />)
      expect(screen.getByText('xss')).toHaveAttribute('href', '#')
    })

    it('blocks vbscript: URLs', () => {
      render(<Markdown content={'[xss](vbscript:msgbox(1))'} />)
      expect(screen.getByText('xss')).toHaveAttribute('href', '#')
    })
  })
})
