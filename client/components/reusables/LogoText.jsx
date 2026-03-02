import CubeLogo from "../icons/CubeLogo";
import TextLogo from "../icons/TextLogo";

export default function LogoText({color="#8F56E8"}) {
  return (
    <a className="cursor-pointer flex items-center gap-[13px]" href="/">
        <span><CubeLogo color={color}/></span>
        <TextLogo color={color}/>
    </a>
  );
}
