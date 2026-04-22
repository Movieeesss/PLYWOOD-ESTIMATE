
            <div className="p-bank-micro">Bank Info</div>
            <div className="p-bank-name">{bankName}</div>
            <div className="p-bank-acc">{accName}</div>
            <div className="p-bank-no">A/C: {accNo}</div>
          </div>
          {qrCode && (
            <div className="p-qr-col">
              <img src={qrCode} alt="QR Code" className="p-qr-img" />
              <span className="p-qr-lbl">Scan to Pay</span>
            </div>
          )}
        </div>

        {/* Bottom Strip */}
        <div className="p-strip">
          <div className="p-strip-note">*Please verify drawings and dimensions before execution.</div>
          <div className="p-strip-thanks">Thank you for choosing {companyName}</div>
        </div>

      </div>
    </div>
  );
};

export default PaymentTracker;
