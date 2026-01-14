import React from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '@/components/common/Modal';
import { useForm } from '@/hooks/form/useForm';
import { useFormValidation } from '@/hooks/form/useFormValidation';
import './WhatsAppEnquiryForm.css';

interface WhatsAppEnquiryFormProps {
  isOpen: boolean;
  onClose: () => void;
  whatsappNumber: string;
  schoolName?: string;
}

interface FormData {
  parentName: string;
  name: string;
  class: string;
  age: string;
  contact: string;
  message?: string;
}

const WhatsAppEnquiryForm: React.FC<WhatsAppEnquiryFormProps> = ({
  isOpen,
  onClose,
  whatsappNumber,
  schoolName = 'MapleKids Play School'
}) => {
  const { t } = useTranslation();
  const validation = useFormValidation();

  const generateWhatsAppMessage = (data: FormData) => {
    const message = `Hello! I'm interested in enrolling my child at ${schoolName}.

*Parent Details:*
• Parent Name: ${data.parentName}

*Child Details:*
• Name: ${data.name}
• Class: ${data.class}
• Age: ${data.age}
• Contact: ${data.contact}

${data.message ? `*Additional Message:*\n${data.message}` : ''}

Please provide me with more information about admission process and fees.

Thank you!`;

    return encodeURIComponent(message);
  };

  const { values, handleChange, handleSubmit, isSubmitting, reset } = useForm<FormData>({
    initialValues: {
      parentName: '',
      name: '',
      class: '',
      age: '',
      contact: '',
      message: ''
    },
    validate: (values) => ({
      parentName: validation.rules.required(t('whatsappEnquiry.form.validation.parentNameRequired', { defaultValue: 'Parent name is required' }))(values.parentName),
      name: validation.rules.required(t('whatsappEnquiry.form.validation.childNameRequired', { defaultValue: 'Child name is required' }))(values.name),
      class: validation.rules.required(t('whatsappEnquiry.form.validation.classRequired', { defaultValue: 'Class is required' }))(values.class),
      age: validation.rules.required(t('whatsappEnquiry.form.validation.ageRequired', { defaultValue: 'Age is required' }))(values.age),
      contact: validation.composeValidators(
        validation.rules.required(t('whatsappEnquiry.form.validation.contactRequired', { defaultValue: 'Contact number is required' })),
        validation.rules.phone(t('whatsappEnquiry.form.validation.invalidPhone'))
      )(values.contact),
    }),
    onSubmit: async (values) => {
      try {
        const message = generateWhatsAppMessage(values);
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
        
        // Open WhatsApp in new tab
        window.open(whatsappUrl, '_blank');
        
        // Reset form and close modal after a short delay
        reset();
        setTimeout(() => {
          onClose();
        }, 1000);
        
      } catch (error) {
        console.error('Error opening WhatsApp:', error);
        alert(t('common.error') + ': Unable to open WhatsApp. Please try again.');
      }
    }
  });

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('whatsappEnquiry.title')}
      className="whatsapp-enquiry-modal"
    >
      <div className="whatsapp-enquiry-container">
        <div className="whatsapp-header">
          <h3>{t('whatsappEnquiry.header.title')}</h3>
          <p>{t('whatsappEnquiry.header.description')}</p>
        </div>

        <form onSubmit={handleSubmit} className="whatsapp-form">
          <div className="form-group">
            <label htmlFor="parentName">{t('whatsappEnquiry.form.parentName')} *</label>
            <input
              type="text"
              id="parentName"
              name="parentName"
              value={values.parentName}
              onChange={handleChange}
              placeholder={t('whatsappEnquiry.form.parentNamePlaceholder')}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">{t('whatsappEnquiry.form.childName')} *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={values.name}
                onChange={handleChange}
                placeholder={t('whatsappEnquiry.form.childNamePlaceholder')}
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="class">{t('whatsappEnquiry.form.class')} *</label>
              <input
                type="text"
                id="class"
                name="class"
                value={values.class}
                onChange={handleChange}
                placeholder={t('whatsappEnquiry.form.classPlaceholder')}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="age">{t('whatsappEnquiry.form.age')} *</label>
              <input
                type="text"
                id="age"
                name="age"
                value={values.age}
                onChange={handleChange}
                placeholder={t('whatsappEnquiry.form.agePlaceholder')}
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="contact">{t('whatsappEnquiry.form.contact')} *</label>
              <input
                type="tel"
                id="contact"
                name="contact"
                value={values.contact}
                onChange={handleChange}
                placeholder={t('whatsappEnquiry.form.contactPlaceholder')}
                required
                disabled={isSubmitting}
                maxLength={10}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="message">{t('whatsappEnquiry.form.message')}</label>
            <textarea
              id="message"
              name="message"
              value={values.message}
              onChange={handleChange}
              placeholder={t('whatsappEnquiry.form.messagePlaceholder')}
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={handleClose}
              className="btn-cancel"
              disabled={isSubmitting}
            >
              {t('whatsappEnquiry.buttons.cancel')}
            </button>
            <button
              type="submit"
              className="btn-whatsapp"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="loading-spinner"></span>
                  {t('whatsappEnquiry.buttons.openingWhatsApp')}
                </>
              ) : (
                <>
                  <span className="whatsapp-icon-small">📱</span>
                  {t('whatsappEnquiry.buttons.sendWhatsApp')}
                </>
              )}
            </button>
          </div>
        </form>

        <div className="whatsapp-info">
          <p><strong>{t('common.note', { defaultValue: 'Note' })}:</strong> {t('whatsappEnquiry.info.note')}</p>
        </div>
      </div>
    </Modal>
  );
};

export default WhatsAppEnquiryForm;
