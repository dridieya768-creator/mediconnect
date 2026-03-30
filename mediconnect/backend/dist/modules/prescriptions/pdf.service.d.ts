/// <reference types="node" />
export declare class PdfService {
    generatePrescriptionPdf(prescription: any, doctorName: string, patientName: string): Promise<Buffer>;
}
