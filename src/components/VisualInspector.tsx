import { useEffect, useState, useCallback } from 'react';
import { X, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface VisualInspectorProps {
  isActive: boolean;
  onClose: () => void;
  onElementSelect: (elementInfo: string) => void;
}

interface ElementInfo {
  tag: string;
  classes: string[];
  id?: string;
  text?: string;
  component?: string;
}

export const VisualInspector = ({ isActive, onClose, onElementSelect }: VisualInspectorProps) => {
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null);
  const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({});
  const [elementInfo, setElementInfo] = useState<ElementInfo | null>(null);

  const getElementInfo = useCallback((element: HTMLElement): ElementInfo => {
    const tag = element.tagName.toLowerCase();
    const classes = Array.from(element.classList);
    const id = element.id || undefined;
    const text = element.textContent?.slice(0, 50) || undefined;
    
    // Try to identify React component from class names or data attributes
    let component = element.getAttribute('data-component');
    if (!component) {
      // Try to infer component from class names
      const componentClasses = classes.find(c => 
        c.includes('Hero') || c.includes('Navigation') || c.includes('Footer') || 
        c.includes('Sidebar') || c.includes('Contact') || c.includes('About') ||
        c.includes('Services') || c.includes('Portfolio') || c.includes('Testimonials') ||
        c.includes('Pricing') || c.includes('FAQ') || c.includes('Blog') || c.includes('CTA')
      );
      component = componentClasses;
    }
    
    return { tag, classes, id, text, component };
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isActive) return;
    
    // Get the actual element, not the overlay
    const elements = document.elementsFromPoint(e.clientX, e.clientY);
    const targetElement = elements.find(el => 
      !el.closest('.visual-inspector-overlay') && 
      !el.closest('.visual-inspector-controls')
    ) as HTMLElement;
    
    if (!targetElement || targetElement === hoveredElement) return;
    
    setHoveredElement(targetElement);
    
    const rect = targetElement.getBoundingClientRect();
    setHighlightStyle({
      position: 'fixed',
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      pointerEvents: 'none',
      transition: 'all 0.1s ease',
    });
    
    setElementInfo(getElementInfo(targetElement));
  }, [isActive, hoveredElement, getElementInfo]);

  const handleClick = useCallback((e: MouseEvent) => {
    if (!isActive || !hoveredElement || !elementInfo) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Build a descriptive string about the element
    let description = '';
    
    if (elementInfo.component) {
      description = elementInfo.component;
    } else if (elementInfo.id) {
      description = `#${elementInfo.id}`;
    } else if (elementInfo.classes.length > 0) {
      // Filter out utility classes and find meaningful ones
      const meaningfulClasses = elementInfo.classes.filter(c => 
        !c.startsWith('text-') && 
        !c.startsWith('bg-') && 
        !c.startsWith('p-') && 
        !c.startsWith('m-') &&
        !c.startsWith('w-') &&
        !c.startsWith('h-') &&
        !c.startsWith('flex') &&
        !c.startsWith('grid')
      );
      description = meaningfulClasses.join(' ') || elementInfo.tag;
    } else {
      description = `${elementInfo.tag} element`;
    }
    
    if (elementInfo.text) {
      description += ` ("${elementInfo.text}")`;
    }
    
    onElementSelect(description);
    onClose();
  }, [isActive, hoveredElement, elementInfo, onElementSelect, onClose]);

  useEffect(() => {
    if (!isActive) {
      setHoveredElement(null);
      setElementInfo(null);
      return;
    }

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleClick, true);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick, true);
    };
  }, [isActive, handleMouseMove, handleClick]);

  if (!isActive) return null;

  return (
    <>
      {/* Overlay backdrop */}
      <div 
        className="visual-inspector-overlay fixed inset-0 bg-primary/5 backdrop-blur-[1px] z-[9998]"
        style={{ pointerEvents: 'none' }}
      />
      
      {/* Highlight border */}
      {hoveredElement && (
        <div
          style={highlightStyle}
          className="border-2 border-primary bg-primary/10 z-[9999] rounded"
        />
      )}
      
      {/* Controls */}
      <div className="visual-inspector-controls fixed top-4 left-1/2 -translate-x-1/2 z-[10000] flex items-center gap-3 bg-background border-2 border-primary rounded-full px-6 py-3 shadow-2xl">
        <Eye className="h-5 w-5 text-primary animate-pulse" />
        <span className="text-sm font-medium">Click any element to select it</span>
        {elementInfo && (
          <Badge variant="secondary" className="ml-2">
            {elementInfo.component || elementInfo.tag}
          </Badge>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 rounded-full ml-2"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
};
