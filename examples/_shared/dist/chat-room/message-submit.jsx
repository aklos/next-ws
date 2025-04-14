'use client';
import { useCallback } from 'react';
export function MessageSubmit({ onMessage, }) {
    const handleSubmit = useCallback((event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const author = form.get('author');
        const content = form.get('content');
        if (!author || !content)
            return;
        onMessage({ author, content });
        // Reset the content input (only)
        const contentInputElement = event.currentTarget //
            .querySelector('input[name="content"]');
        if (contentInputElement)
            contentInputElement.value = '';
    }, [onMessage]);
    return (<form onSubmit={handleSubmit} style={{ display: 'flex' }}>
      <input name="author" style={{ width: '70px' }} type="text" placeholder="Your name"/>
      <input name="content" style={{ width: '280px' }} type="text" placeholder="Your message"/>
      <button type="submit">Send</button>
    </form>);
}
//# sourceMappingURL=message-submit.jsx.map