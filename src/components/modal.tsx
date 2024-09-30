import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogTitle
} from "@/components/ui/dialog";

export function PagamentoModal({ url }: { url?: string }) {
    return <Dialog open={!!url} modal={true}>
        <DialogContent
            closable={false}
            className="w-full max-w-screen-lg h-5/6 my-2 p-0"
            onInteractOutside={(e) => {
                e.preventDefault();
            }}>
            <DialogTitle className="hidden">Pagamento</DialogTitle>
            <iframe src={url} className="w-full h-full rounded" allow="clipboard-read; clipboard-write"></iframe>
        </DialogContent>
    </Dialog>
}