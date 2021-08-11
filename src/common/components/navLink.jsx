import Link from 'next/link';
import PropTypes from 'prop-types';
import Icon from "./Icon";

const NavLink = ({ children, href, leftIcon, rightIcon, iconWidth, iconHeight, iconStyles, iconColor, ...rest }) => (
  <Link href={href} >
    <a  {...rest}>
      {leftIcon ? <Icon icon={leftIcon} width={iconWidth} height={iconHeight} style={iconStyles} color={iconColor}/> : null}  
        {children}
      {rightIcon ? <Icon icon={rightIcon} width={iconWidth} height={iconHeight} style={iconStyles} color={iconColor}/> : null}
    </a>
  </Link>
);

NavLink.propTypes = {
  children: PropTypes.element,
  href: PropTypes.string.isRequired,
  iconHeight: PropTypes.string,
  iconWidth: PropTypes.string,
  iconStyles: PropTypes.object,
  rightIcon: PropTypes.string,
  leftIcon: PropTypes.string,
  iconColor: PropTypes.string,
};
NavLink.defaultProps = {
  href: ""
};

export default NavLink;