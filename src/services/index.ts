import { apiFetch } from '../api/client'

export const applicantService = {
  getMyApplication: () => apiFetch<any>('/ppdb/applicants/me'),
  register: (body: any) => apiFetch<any>('/ppdb/applicants/register', { method: 'POST', body: JSON.stringify(body) }),
  updateProfile: (body: any) => apiFetch<any>('/ppdb/applicants/me/profile', { method: 'PUT', body: JSON.stringify(body) }),
  getParents: () => apiFetch<any[]>('/ppdb/applicants/me/parents'),
  saveParent: (type: string, body: any) => apiFetch<any>(`/ppdb/applicants/me/parents/${type}`, { method: 'PUT', body: JSON.stringify(body) }),
  getStatusHistory: () => apiFetch<any[]>('/ppdb/applicants/me/status-history'),
  getApplicants: (params?: any) => apiFetch<any>(`/ppdb/applicants${params ? '?' + new URLSearchParams(params) : ''}`),
  getApplicantDetail: (id: string) => apiFetch<any>(`/ppdb/applicants/${id}`),
  updateApplicantStatus: (id: string, body: any) => apiFetch<any>(`/ppdb/applicants/${id}/status`, { method: 'POST', body: JSON.stringify(body) }),
}

export const documentService = {
  getRequirements: (levelId?: string) => apiFetch<any[]>(`/ppdb/document-requirements${levelId ? '?level_id=' + levelId : ''}`),
  createRequirement: (body: any) => apiFetch<any>('/ppdb/document-requirements', { method: 'POST', body: JSON.stringify(body) }),
  updateRequirement: (id: string, body: any) => apiFetch<any>(`/ppdb/document-requirements/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteRequirement: (id: string) => apiFetch<void>(`/ppdb/document-requirements/${id}`, { method: 'DELETE' }),
  getChecklist: () => apiFetch<any>('/ppdb/applicants/me/document-checklist'),
  uploadDocument: (requirementId: string, file: File) => { const fd = new FormData(); fd.append('file', file); fd.append('requirement_id', requirementId); return apiFetch<any>('/ppdb/applicants/me/documents', { method: 'POST', body: fd }) },
  getReviewQueue: (params?: any) => apiFetch<any>(`/ppdb/admin/documents/review${params ? '?' + new URLSearchParams(params) : ''}`),
  reviewDocument: (id: string, body: any) => apiFetch<any>(`/ppdb/admin/documents/${id}/review`, { method: 'PUT', body: JSON.stringify(body) }),
}

export const paymentService = {
  getMyInvoices: () => apiFetch<any[]>('/payment/invoices/mine'),
  submitPayment: (invoiceId: string, amount: number, file: File, method = 'transfer') => { const fd = new FormData(); fd.append('file', file); fd.append('invoice_id', invoiceId); fd.append('amount', String(amount)); fd.append('payment_method', method); return apiFetch<any>('/payment/transactions', { method: 'POST', body: fd }) },
  generateInvoices: (applicantId: string) => apiFetch<any>('/payment/invoices/generate', { method: 'POST', body: JSON.stringify({ applicant_id: applicantId }) }),
  getTransactions: (params?: any) => apiFetch<any>(`/payment/transactions${params ? '?' + new URLSearchParams(params) : ''}`),
  verifyTransaction: (id: string, status: string, notes?: string) => apiFetch<any>(`/payment/transactions/${id}/verify`, { method: 'PUT', body: JSON.stringify({ status, notes: notes || null }) }),
  getDiscounts: () => apiFetch<any[]>('/payment/discounts'),
  createDiscount: (body: any) => apiFetch<any>('/payment/discounts', { method: 'POST', body: JSON.stringify(body) }),
  updateDiscount: (id: string, body: any) => apiFetch<any>(`/payment/discounts/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteDiscount: (id: string) => apiFetch<void>(`/payment/discounts/${id}`, { method: 'DELETE' }),
  assignDiscount: (applicantId: string, discountId: string, invoiceId?: string) => apiFetch<any>('/payment/discounts/assign', { method: 'POST', body: JSON.stringify({ applicant_id: applicantId, discount_id: discountId, invoice_id: invoiceId || null }) }),
}

export const selectionService = {
  getTestTypes: () => apiFetch<any[]>('/selection/test-types'),
  createTestType: (body: any) => apiFetch<any>('/selection/test-types', { method: 'POST', body: JSON.stringify(body) }),
  getParameters: (testTypeId?: string) => apiFetch<any[]>(`/selection/test-parameters${testTypeId ? '?test_type_id=' + testTypeId : ''}`),
  getSessions: (params?: any) => apiFetch<any>(`/selection/sessions${params ? '?' + new URLSearchParams(params) : ''}`),
  createSession: (body: any) => apiFetch<any>('/selection/sessions', { method: 'POST', body: JSON.stringify(body) }),
  updateSession: (id: string, body: any) => apiFetch<any>(`/selection/sessions/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  getMySessions: () => apiFetch<any[]>('/selection/applicants/me/sessions'),
  getMyResults: () => apiFetch<any[]>('/selection/applicants/me/results'),
  getMyGraduation: () => apiFetch<any>('/selection/applicants/me/graduation'),
  saveResult: (body: any) => apiFetch<any>('/selection/results', { method: 'POST', body: JSON.stringify(body) }),
  getGraduations: (params?: any) => apiFetch<any>(`/selection/graduations${params ? '?' + new URLSearchParams(params) : ''}`),
  setGraduation: (body: any) => apiFetch<any>('/selection/graduations', { method: 'POST', body: JSON.stringify(body) }),
  getGraduationRules: (waveConfigId?: string) => apiFetch<any[]>(`/selection/graduation-rules${waveConfigId ? '?wave_config_id=' + waveConfigId : ''}`),
  createGraduationRule: (body: any) => apiFetch<any>('/selection/graduation-rules', { method: 'POST', body: JSON.stringify(body) }),
}

export const postService = {
  getMouTemplates: () => apiFetch<any[]>('/post/mou-templates'),
  createMouTemplate: (body: any) => apiFetch<any>('/post/mou-templates', { method: 'POST', body: JSON.stringify(body) }),
  generateMou: (applicantId: string, templateId: string) => apiFetch<any>('/post/mou/generate', { method: 'POST', body: JSON.stringify({ applicant_id: applicantId, template_id: templateId }) }),
  getMouList: (params?: any) => apiFetch<any>(`/post/mou${params ? '?' + new URLSearchParams(params) : ''}`),
  getMyMou: () => apiFetch<any>('/post/mou/mine'),
  signMou: (mouId: string, file: File) => { const fd = new FormData(); fd.append('signature', file); return apiFetch<any>(`/post/mou/${mouId}/sign`, { method: 'POST', body: fd }) },
  reviewMou: (id: string, status: string) => apiFetch<any>(`/post/mou/${id}/review`, { method: 'PUT', body: JSON.stringify({ status }) }),
  getAcceptanceLetters: (params?: any) => apiFetch<any>(`/post/acceptance-letters${params ? '?' + new URLSearchParams(params) : ''}`),
  generateAcceptanceLetter: (applicantId: string) => apiFetch<any>('/post/acceptance-letters/generate', { method: 'POST', body: JSON.stringify({ applicant_id: applicantId }) }),
  getMyAcceptanceLetter: () => apiFetch<any>('/post/acceptance-letters/mine'),
  getReRegistrations: (params?: any) => apiFetch<any>(`/post/re-registrations${params ? '?' + new URLSearchParams(params) : ''}`),
  createReRegistration: (body: any) => apiFetch<any>('/post/re-registrations', { method: 'POST', body: JSON.stringify(body) }),
  updateReRegistration: (id: string, body: any) => apiFetch<any>(`/post/re-registrations/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  getMyReRegistration: () => apiFetch<any>('/post/re-registrations/mine'),
  getMplsSchedules: () => apiFetch<any[]>('/post/mpls-schedules'),
  createMplsSchedule: (body: any) => apiFetch<any>('/post/mpls-schedules', { method: 'POST', body: JSON.stringify(body) }),
  assignMpls: (applicantId: string, scheduleId: string) => apiFetch<any>('/post/mpls/assign', { method: 'POST', body: JSON.stringify({ applicant_id: applicantId, schedule_id: scheduleId }) }),
  getMplsList: () => apiFetch<any[]>('/post/mpls'),
  getMyMpls: () => apiFetch<any[]>('/post/mpls/mine'),
}

export const notifService = {
  getTemplates: () => apiFetch<any[]>('/notif/templates'),
  createTemplate: (body: any) => apiFetch<any>('/notif/templates', { method: 'POST', body: JSON.stringify(body) }),
  sendNotification: (body: any) => apiFetch<any>('/notif/send', { method: 'POST', body: JSON.stringify(body) }),
  getHistory: (params?: any) => apiFetch<any>(`/notif/history${params ? '?' + new URLSearchParams(params) : ''}`),
  getMyNotifications: () => apiFetch<any[]>('/notif/my'),
  markRead: (id: string) => apiFetch<any>(`/notif/${id}/read`, { method: 'PUT' }),
  getCalendar: () => apiFetch<any[]>('/notif/calendar'),
  getAdminCalendar: () => apiFetch<any[]>('/notif/calendar/admin'),
  createCalendarEvent: (body: any) => apiFetch<any>('/notif/calendar', { method: 'POST', body: JSON.stringify(body) }),
  updateCalendarEvent: (id: string, body: any) => apiFetch<any>(`/notif/calendar/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
}

export const dashboardService = {
  getStats: () => apiFetch<any>('/dashboard/stats'),
  getAuditLogs: (params?: any) => apiFetch<any>(`/dashboard/audit-logs${params ? '?' + new URLSearchParams(params) : ''}`),
  getReportsSummary: () => apiFetch<any>('/dashboard/reports/summary'),
}

export const settingsService = {
  getAll: () => apiFetch<{ key: string; value: string }[]>('/companyprofile/settings'),
  getFavicon: () => apiFetch<{ value: string }>('/companyprofile/settings/favicon'),
}
