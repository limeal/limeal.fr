interface Tab {
    type: "button" | "link";
    tid: string;
    href?: string;
    onClick?: () => void;
}
