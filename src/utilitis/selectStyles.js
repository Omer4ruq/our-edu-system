import { primaryColor, secondaryColor } from "./getTheme";

  

  
  
  const selectStyles = {
    control: (base) => ({
      ...base,
      background: 'transparent',
      borderColor: '#9d9087',
      borderRadius: '8px',
      paddingLeft: '0.75rem',
      padding: '3px',
      color: primaryColor,
      fontFamily: "'Noto Sans Bengali', sans-serif",
      fontSize: '16px',
      transition: 'all 0.3s ease',
      '&:hover': { borderColor: '#fff' },
      '&:focus': { outline: 'none', boxShadow: 'none' },
    }),
    placeholder: (base) => ({
      ...base,
      color: '#fff',
      opacity: 0.7,
      fontFamily: "'Noto Sans Bengali', sans-serif",
      fontSize: '16px',
    }),
    singleValue: (base) => ({
      ...base,
      color: primaryColor,
      fontFamily: "'Noto Sans Bengali', sans-serif",
      fontSize: '16px',
    }),
    input: (base) => ({
      ...base,
      color: primaryColor,
      fontFamily: "'Noto Sans Bengali', sans-serif",
      fontSize: '16px',
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: secondaryColor,
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '8px',
      zIndex: 9999,
      marginTop: '4px',
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
    option: (base, { isFocused, isSelected }) => ({
      ...base,
      color: '#fff',
      fontFamily: "'Noto Sans Bengali', sans-serif",
      fontSize: '16px',
      backgroundColor: isSelected ? primaryColor : isFocused ? primaryColor : 'transparent',
      cursor: 'pointer',
      '&:active': { backgroundColor: '#DB9E30' },
    }),
  };


  export default selectStyles;