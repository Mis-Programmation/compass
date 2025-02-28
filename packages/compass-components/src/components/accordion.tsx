import React, { useState } from 'react';
import { spacing } from '@leafygreen-ui/tokens';
import { css } from '@emotion/css';
import Icon from '@leafygreen-ui/icon';
import { uiColors } from '@leafygreen-ui/palette';
import { useId } from '@react-aria/utils';

const labelStyles = css({
  padding: 0,
  margin: 0,
  fontWeight: 'bold',
});

const buttonStyles = css({
  display: 'flex',
  alignItems: 'center',
  border: 'none',
  background: 'none',
  borderRadius: '6px',
  boxShadow: 'none',
  transition: 'box-shadow 150ms ease-in-out',
  '&:focus-visible': {
    boxShadow: `0 0 0 3px ${uiColors.focus}`,
  },
});
const containerStyles = css({
  marginTop: spacing[3],
  display: 'flex',
  alignItems: 'center',
  '&:hover': {
    cursor: 'pointer',
  },
});
interface AccordionProps {
  dataTestId?: string;
  text: string;
}
function Accordion(
  props: React.PropsWithChildren<AccordionProps>
): React.ReactElement {
  const [open, setOpen] = useState(false);
  const regionId = useId('region-');
  const labelId = useId('label-');
  return (
    <div data-testid={props.dataTestId}>
      <div className={containerStyles}>
        <p className={labelStyles} id={labelId}>
          <button
            className={buttonStyles}
            type="button"
            aria-expanded={open ? 'true' : 'false'}
            aria-controls={regionId}
            onClick={() => {
              setOpen((currentOpen) => !currentOpen);
            }}
          >
            <Icon glyph={open ? 'ChevronDown' : 'ChevronRight'} />
            {props.text}
          </button>
        </p>
      </div>

      {open && (
        <div role="region" aria-labelledby={labelId} id={regionId}>
          {props.children}
        </div>
      )}
    </div>
  );
}

export default Accordion;
