import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Card, Button, Input, Modal, Badge } from '../../components/UI';
import { 
  DollarSign, 
  Download, 
  CreditCard, 
  FileText, 
  Settings, 
  Mail, 
  Building2,
  Calendar,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Edit2
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { PayoutOverview, PayoutMethod, MonthlyStatement, DailyInvoice, PartnerDetails, EmailSettings, LegalDocument } from '../../types';

const Financials: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedProductType, setSelectedProductType] = useState<string>('all');
  const [showPayoutMethodModal, setShowPayoutMethodModal] = useState(false);
  const [showPartnerDetailsModal, setShowPartnerDetailsModal] = useState(false);
  const [isEditingPartnerDetails, setIsEditingPartnerDetails] = useState(false);

  // Fetch financial data
  const { data: payoutOverview } = useQuery({
    queryKey: ['payoutOverview', user?.id],
    queryFn: () => api.getPayoutOverview(user!.id),
    enabled: !!user
  });

  const { data: monthlyStatements } = useQuery({
    queryKey: ['monthlyStatements', user?.id],
    queryFn: () => api.getMonthlyStatements(user!.id),
    enabled: !!user
  });

  const { data: dailyInvoices } = useQuery({
    queryKey: ['dailyInvoices', user?.id, selectedDate, selectedProductType],
    queryFn: () => api.getDailyInvoices(user!.id, selectedDate, selectedProductType),
    enabled: !!user
  });

  const { data: partnerDetails } = useQuery({
    queryKey: ['partnerDetails', user?.id],
    queryFn: () => api.getPartnerDetails(user!.id),
    enabled: !!user
  });

  const { data: emailSettings } = useQuery({
    queryKey: ['emailSettings', user?.id],
    queryFn: () => api.getEmailSettings(user!.id),
    enabled: !!user
  });

  const { data: legalDocuments } = useQuery({
    queryKey: ['legalDocuments'],
    queryFn: () => api.getLegalDocuments(),
  });

  // Mutations
  const updateEmailSettingsMutation = useMutation({
    mutationFn: (settings: EmailSettings) => api.updateEmailSettings(user!.id, settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailSettings'] });
      toast.success('Email settings updated');
    }
  });

  const updatePartnerDetailsMutation = useMutation({
    mutationFn: (details: PartnerDetails) => api.updatePartnerDetails(user!.id, details),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partnerDetails'] });
      setIsEditingPartnerDetails(false);
      toast.success('Partner details updated');
    }
  });

  const savePayoutMethodMutation = useMutation({
    mutationFn: (method: Partial<PayoutMethod>) => api.savePayoutMethod(user!.id, method),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payoutOverview'] });
      setShowPayoutMethodModal(false);
      toast.success('Payout method saved');
    }
  });

  // Download handlers
  const handleDownload = async (type: 'order_summaries' | 'invoices' | 'account_statements') => {
    try {
      const url = await api.downloadMonthlyStatement(user!.id, selectedMonth, selectedYear, type);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${type}_${selectedYear}_${String(selectedMonth).padStart(2, '0')}.pdf`;
      link.click();
      toast.success('Download started');
    } catch (error) {
      toast.error('Failed to download');
    }
  };

  const handleDownloadInvoice = async (orderId: string, type: 'invoice' | 'credit_note') => {
    try {
      const url = await api.downloadInvoice(user!.id, orderId, type);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${type}_${orderId}.pdf`;
      link.click();
      toast.success('Download started');
    } catch (error) {
      toast.error('Failed to download');
    }
  };

  // Form states
  const [payoutMethodForm, setPayoutMethodForm] = useState({
    bankName: '',
    accountNumber: '',
    accountHolderName: ''
  });

  const [partnerDetailsForm, setPartnerDetailsForm] = useState<PartnerDetails>({
    businessName: '',
    address: '',
    postalCode: '',
    city: '',
    country: 'Singapore',
    invoiceEmail: ''
  });

  React.useEffect(() => {
    if (partnerDetails) {
      setPartnerDetailsForm(partnerDetails);
    }
  }, [partnerDetails]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">Financials</h1>
        <p className="text-lg text-gray-600">Manage your payouts, statements, and financial documents</p>
      </div>

      {/* 1. PAYOUT OVERVIEW SECTION */}
      <Card className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Payout Overview</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-6 border border-primary-200">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="text-primary-600" size={24} />
              <p className="text-sm font-medium text-gray-700">Current Accrued (This Month)</p>
            </div>
            <p className="text-4xl font-bold text-gray-900">${payoutOverview?.currentAccrued.toFixed(2) || '0.00'}</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="text-gray-600" size={24} />
              <p className="text-sm font-medium text-gray-700">Next Payout Date</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {payoutOverview?.nextPayoutDate ? new Date(payoutOverview.nextPayoutDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : 'N/A'}
            </p>
            <p className="text-sm text-gray-600 mt-1">Payout Cycle: {payoutOverview?.payoutCycle || 'Monthly'}</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-blue-600 shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-semibold text-blue-900 mb-1">How Payouts Work</p>
              <p className="text-sm text-blue-800">
                Payouts are processed monthly. You'll receive your net earnings (after platform fees) 
                once you reach the minimum threshold of ${payoutOverview?.minimumThreshold || 50}. 
                Payouts are typically sent within 5-7 business days after the end of each month.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Minimum Payout Threshold</p>
            <p className="text-xl font-bold text-gray-900">${payoutOverview?.minimumThreshold || 50}</p>
          </div>
          <Button 
            onClick={() => setShowPayoutMethodModal(true)}
            variant="primary"
            className="flex items-center gap-2"
          >
            <CreditCard size={18} />
            {payoutOverview?.payoutMethod ? 'Update Payout Method' : 'Add Payout Method'}
          </Button>
        </div>
      </Card>

      {/* 2. MONTHLY STATEMENTS DOWNLOADER */}
      <Card className="p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Monthly Statements</h2>
        
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <option key={month} value={month}>
                  {new Date(2024, month - 1).toLocaleDateString('en-US', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <Button 
              onClick={() => handleDownload('account_statements')}
              variant="outline"
              className="w-full"
            >
              <Download size={18} className="mr-2" />
              Download All
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Button 
            onClick={() => handleDownload('order_summaries')}
            variant="secondary"
            className="flex items-center justify-center gap-2"
          >
            <FileText size={18} />
            Download Order Summaries
          </Button>
          <Button 
            onClick={() => handleDownload('invoices')}
            variant="secondary"
            className="flex items-center justify-center gap-2"
          >
            <FileText size={18} />
            Download Invoices
          </Button>
          <Button 
            onClick={() => handleDownload('account_statements')}
            variant="secondary"
            className="flex items-center justify-center gap-2"
          >
            <FileText size={18} />
            Download Account Statements
          </Button>
        </div>
      </Card>

      {/* 3. DAILY ORDER INVOICES + CREDIT NOTES */}
      <Card className="p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Daily Order Invoices</h2>
        
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Type</label>
            <select
              value={selectedProductType}
              onChange={(e) => setSelectedProductType(e.target.value)}
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="all">All Types</option>
              <option value="Meals">Meals</option>
              <option value="Bread & Pastries">Bread & Pastries</option>
              <option value="Groceries">Groceries</option>
              <option value="Dessert">Dessert</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {dailyInvoices && dailyInvoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 font-medium">
                <tr>
                  <th className="px-4 py-3 text-left">Order ID</th>
                  <th className="px-4 py-3 text-left">Product Type</th>
                  <th className="px-4 py-3 text-right">Total Amount</th>
                  <th className="px-4 py-3 text-center">Invoice</th>
                  <th className="px-4 py-3 text-center">Credit Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dailyInvoices.map((invoice) => (
                  <tr key={invoice.orderId} className="hover:bg-gray-50">
                    <td className="px-4 py-4 font-mono text-xs">{invoice.orderId}</td>
                    <td className="px-4 py-4">{invoice.productType}</td>
                    <td className="px-4 py-4 text-right font-semibold">${invoice.totalAmount.toFixed(2)}</td>
                    <td className="px-4 py-4 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadInvoice(invoice.orderId, 'invoice')}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        <Download size={16} className="mr-1" />
                        Download
                      </Button>
                    </td>
                    <td className="px-4 py-4 text-center">
                      {invoice.creditNoteUrl ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadInvoice(invoice.orderId, 'credit_note')}
                          className="text-primary-600 hover:text-primary-700"
                        >
                          <Download size={16} className="mr-1" />
                          Download
                        </Button>
                      ) : (
                        <span className="text-gray-400 text-xs">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
            <AlertCircle className="mx-auto text-gray-400 mb-3" size={48} />
            <p className="text-gray-600 font-medium mb-1">No orders found</p>
            <p className="text-sm text-gray-500">
              You don't have any orders on this day. Invoices are generated at the time when customers pick up their meal.
            </p>
          </div>
        )}
      </Card>

      {/* 4. CONTRACTUAL PARTNER DETAILS */}
      <Card className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Contractual Partner Details</h2>
          <Button
            variant="outline"
            onClick={() => {
              setIsEditingPartnerDetails(true);
              setShowPartnerDetailsModal(true);
            }}
            className="flex items-center gap-2"
          >
            <Edit2 size={18} />
            View/Edit Details
          </Button>
        </div>

        {partnerDetails && (
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Business Name</p>
              <p className="font-semibold text-gray-900">{partnerDetails.businessName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Invoice Email</p>
              <p className="font-semibold text-gray-900">{partnerDetails.invoiceEmail}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Address</p>
              <p className="font-semibold text-gray-900">{partnerDetails.address}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Postal Code</p>
              <p className="font-semibold text-gray-900">{partnerDetails.postalCode}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">City</p>
              <p className="font-semibold text-gray-900">{partnerDetails.city}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Country</p>
              <p className="font-semibold text-gray-900">{partnerDetails.country}</p>
            </div>
          </div>
        )}
      </Card>

      {/* 5. MONTHLY SALES OVERVIEW EMAIL SETTINGS */}
      <Card className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <Mail className="text-primary-600" size={24} />
          <h2 className="text-2xl font-bold text-gray-900">Monthly Sales Overview Email</h2>
        </div>

        {emailSettings && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div>
                <p className="font-semibold text-gray-900 mb-1">Enable Monthly Email</p>
                <p className="text-sm text-gray-600">Receive a monthly summary of your sales and payouts</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailSettings.enabled}
                  onChange={(e) => updateEmailSettingsMutation.mutate({ ...emailSettings, enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            {emailSettings.enabled && (
              <div className="space-y-4 p-4 bg-primary-50 rounded-xl border border-primary-200">
                <p className="font-semibold text-gray-900 mb-3">Email Content</p>
                <div className="space-y-3">
                  {[
                    { key: 'includeAccountStatements', label: 'Account Statements' },
                    { key: 'includeOrderSummaries', label: 'Order Summaries' },
                    { key: 'includeInvoices', label: 'Invoices' },
                    { key: 'includeSelfBillingInvoices', label: 'Self-billing Invoices' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={emailSettings[key as keyof EmailSettings] as boolean}
                        onChange={(e) => updateEmailSettingsMutation.mutate({
                          ...emailSettings,
                          [key]: e.target.checked
                        })}
                        className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* 6. LEGAL DOCUMENTS SECTION */}
      <Card className="p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Legal Documents</h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          {legalDocuments?.map((doc) => (
            <motion.a
              key={doc.id}
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3">
                <FileText className="text-gray-600 group-hover:text-primary-600 transition-colors" size={20} />
                <span className="font-medium text-gray-900">{doc.name}</span>
              </div>
              <ExternalLink className="text-gray-400 group-hover:text-primary-600 transition-colors" size={18} />
            </motion.a>
          ))}
        </div>
      </Card>

      {/* Payout Method Modal */}
      <Modal
        isOpen={showPayoutMethodModal}
        onClose={() => setShowPayoutMethodModal(false)}
        title="Payout Method"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Bank Name"
            value={payoutMethodForm.bankName}
            onChange={(e) => setPayoutMethodForm({ ...payoutMethodForm, bankName: e.target.value })}
            placeholder="e.g., DBS Bank"
          />
          <Input
            label="Account Number"
            value={payoutMethodForm.accountNumber}
            onChange={(e) => setPayoutMethodForm({ ...payoutMethodForm, accountNumber: e.target.value })}
            placeholder="Enter full account number"
            type="text"
          />
          <Input
            label="Account Holder Name"
            value={payoutMethodForm.accountHolderName}
            onChange={(e) => setPayoutMethodForm({ ...payoutMethodForm, accountHolderName: e.target.value })}
            placeholder="Name as it appears on bank account"
          />
          <div className="pt-4 flex gap-3">
            <Button
              variant="primary"
              onClick={() => savePayoutMethodMutation.mutate({
                type: 'bank_account',
                bankName: payoutMethodForm.bankName,
                accountNumber: payoutMethodForm.accountNumber,
                accountHolderName: payoutMethodForm.accountHolderName,
                isDefault: true
              })}
              className="flex-1"
            >
              Save
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowPayoutMethodModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Partner Details Modal */}
      <Modal
        isOpen={showPartnerDetailsModal}
        onClose={() => {
          setShowPartnerDetailsModal(false);
          setIsEditingPartnerDetails(false);
        }}
        title="Partner Details"
        size="lg"
      >
        {isEditingPartnerDetails ? (
          <div className="space-y-4">
            <Input
              label="Business Name"
              value={partnerDetailsForm.businessName}
              onChange={(e) => setPartnerDetailsForm({ ...partnerDetailsForm, businessName: e.target.value })}
            />
            <Input
              label="Address"
              value={partnerDetailsForm.address}
              onChange={(e) => setPartnerDetailsForm({ ...partnerDetailsForm, address: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Postal Code"
                value={partnerDetailsForm.postalCode}
                onChange={(e) => setPartnerDetailsForm({ ...partnerDetailsForm, postalCode: e.target.value })}
              />
              <Input
                label="City"
                value={partnerDetailsForm.city}
                onChange={(e) => setPartnerDetailsForm({ ...partnerDetailsForm, city: e.target.value })}
              />
            </div>
            <Input
              label="Country"
              value={partnerDetailsForm.country}
              onChange={(e) => setPartnerDetailsForm({ ...partnerDetailsForm, country: e.target.value })}
            />
            <Input
              label="Invoice Email"
              type="email"
              value={partnerDetailsForm.invoiceEmail}
              onChange={(e) => setPartnerDetailsForm({ ...partnerDetailsForm, invoiceEmail: e.target.value })}
            />
            <div className="pt-4 flex gap-3">
              <Button
                variant="primary"
                onClick={() => updatePartnerDetailsMutation.mutate(partnerDetailsForm)}
                className="flex-1"
              >
                Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditingPartnerDetails(false);
                  setShowPartnerDetailsModal(false);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {partnerDetails && (
              <>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Business Name</p>
                  <p className="font-semibold text-gray-900">{partnerDetails.businessName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Address</p>
                  <p className="font-semibold text-gray-900">{partnerDetails.address}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Postal Code</p>
                    <p className="font-semibold text-gray-900">{partnerDetails.postalCode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">City</p>
                    <p className="font-semibold text-gray-900">{partnerDetails.city}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Country</p>
                  <p className="font-semibold text-gray-900">{partnerDetails.country}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Invoice Email</p>
                  <p className="font-semibold text-gray-900">{partnerDetails.invoiceEmail}</p>
                </div>
                <div className="pt-4">
                  <Button
                    variant="primary"
                    onClick={() => setIsEditingPartnerDetails(true)}
                    className="w-full"
                  >
                    Edit Details
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Financials;

