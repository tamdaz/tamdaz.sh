import { getCurrentDir } from "./fileSystem";

export const executePwd = () => {
    const cwd = getCurrentDir();
    return <span>{cwd}</span>;
};
