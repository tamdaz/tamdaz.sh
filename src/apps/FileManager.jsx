import React from "react";

import {
    createDirectory,
    deleteFile,
    exists,
    getCurrentDir,
    getFileInfo,
    getParentPath,
    listFiles,
    moveFile,
    readFile,
    removeDirectory,
    resolvePath,
    setCurrentDir,
    writeFile
} from "../commands/fileSystem";

const asReadableSize = (size) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KiB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MiB`;
};

export default function FileManager() {
    const [cwd, setCwd] = React.useState(getCurrentDir());
    const [entries, setEntries] = React.useState(() => listFiles(getCurrentDir()));
    const [selectedPath, setSelectedPath] = React.useState(null);
    const [draftName, setDraftName] = React.useState("");
    const [preview, setPreview] = React.useState("");
    const [status, setStatus] = React.useState("Prêt");

    const selectedInfo = selectedPath ? getFileInfo(selectedPath) : null;

    const refresh = React.useCallback((path = cwd) => {
        const nextPath = resolvePath(path);
        setCurrentDir(nextPath);
        setCwd(nextPath);
        setEntries(listFiles(nextPath));
        setSelectedPath(null);
        setPreview("");
    }, [cwd]);

    const goToParent = () => {
        refresh(getParentPath(cwd));
    };

    const handleOpen = (entry) => {
        setSelectedPath(entry.path);

        if (entry.isDir) {
            refresh(entry.path);
            return;
        }

        const content = readFile(entry.path);
        setPreview(content ?? "");
    };

    const createFileAction = () => {
        const name = draftName.trim();

        if (!name) {
            setStatus("Nom de fichier manquant.");
            return;
        }

        const path = `${cwd}/${name}`;
        if (exists(path)) {
            setStatus("Ce fichier existe déjà.");
            return;
        }

        writeFile(path, "");
        setStatus(`Fichier créé : ${name}`);
        setDraftName("");
        refresh(cwd);
    };

    const createDirectoryAction = () => {
        const name = draftName.trim();

        if (!name) {
            setStatus("Nom de dossier manquant.");
            return;
        }

        const path = `${cwd}/${name}`;
        if (exists(path)) {
            setStatus("Ce dossier existe déjà.");
            return;
        }

        createDirectory(path);
        setStatus(`Dossier créé : ${name}`);
        setDraftName("");
        refresh(cwd);
    };

    const renameAction = () => {
        if (!selectedPath) {
            setStatus("Selectionnez un fichier ou dossier a renommer.");
            return;
        }

        const name = draftName.trim();
        if (!name) {
            setStatus("Nouveau nom manquant.");
            return;
        }

        const destination = `${getParentPath(selectedPath)}/${name}`;
        if (exists(destination)) {
            setStatus("Le nouveau nom existe déjà.");
            return;
        }

        moveFile(selectedPath, destination);
        setStatus(`Renommé vers : ${name}`);
        setDraftName("");
        refresh(cwd);
    };

    const deleteAction = () => {
        if (!selectedPath) {
            setStatus("Selectionnez un fichier ou dossier a supprimer.");
            return;
        }

        const info = getFileInfo(selectedPath);
        if (!info) {
            setStatus("Sélection invalide.");
            refresh(cwd);
            return;
        }

        const ok = info.isDir ? removeDirectory(selectedPath) : deleteFile(selectedPath);

        if (!ok) {
            setStatus(info.isDir ? "Suppression impossible (dossier non vide ?)." : "Suppression impossible.");
            return;
        }

        setStatus(`Supprimé : ${info.name}`);
        refresh(cwd);
    };

    const openSelected = () => {
        if (!selectedPath) {
            setStatus("Sélectionnez un élément à ouvrir.");
            return;
        }

        const info = getFileInfo(selectedPath);
        if (!info) {
            setStatus("Sélection invalide.");
            refresh(cwd);
            return;
        }

        handleOpen({ path: selectedPath, isDir: info.isDir });
    };

    return <div className="tz-sh-panel">
        <div className="tz-sh-toolbar">
            <span>Dossier courant: {cwd}</span>
            <button onClick={goToParent}>Parent</button>
            <button onClick={() => refresh(cwd)}>Rafraîchir</button>
        </div>

        <div className="tz-sh-toolbar">
            <input
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder="Nom fichier ou dossier"
            />
            <button onClick={createFileAction}>Nouveau fichier</button>
            <button onClick={createDirectoryAction}>Nouveau dossier</button>
            <button onClick={renameAction}>Renommer</button>
            <button onClick={deleteAction}>Supprimer</button>
            <button onClick={openSelected}>Ouvrir</button>
        </div>

        <div className="tz-sh-split">
            <div className="tz-sh-box">
                {entries.map((entry) => {
                    const selected = selectedPath === entry.path;
                    return <div
                        key={entry.path}
                        className={`tz-sh-row ${selected ? "selected" : ""}`}
                        onClick={() => setSelectedPath(entry.path)}
                        onDoubleClick={() => handleOpen(entry)}
                    >
                        <span>{entry.name}{entry.isDir ? "/" : ""}</span>
                        <span>{entry.isDir ? "DIR" : "FILE"}</span>
                        <span>{asReadableSize(entry.size || 0)}</span>
                    </div>;
                })}
            </div>

            <div className="tz-sh-box" style={{ padding: "8px", whiteSpace: "pre-wrap" }}>
                {selectedInfo && <>
                    <div>Nom: {selectedInfo.name}</div>
                    <div>Chemin: {selectedInfo.path}</div>
                    <div>Type: {selectedInfo.isDir ? "Répertoire" : "Fichier"}</div>
                    <div>Permissions: {selectedInfo.permissions}</div>
                    <div>Propriétaire: {selectedInfo.owner}:{selectedInfo.group}</div>
                    <div>Taille: {asReadableSize(selectedInfo.size)}</div>
                    <div style={{ marginTop: "8px", opacity: 0.8 }}>Aperçu:</div>
                </>}
                <div>{preview}</div>
            </div>
        </div>

        <div className="tz-sh-status">{status}</div>
    </div>;
}
