import Linkify from 'react-linkify';

const linkifyDecorator = (href: string, text: string, key: number) => (
  <a href={href} key={key} target='_blank' rel='noopener noreferrer' className='my-custom-link'>
    {text}
  </a>
);

export const CustomLinkify = ({ children }: { children: React.ReactNode }) => {
  return <Linkify componentDecorator={linkifyDecorator}>{children}</Linkify>;
};

