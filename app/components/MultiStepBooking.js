/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Users, Calendar, MapPin, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import { bookingRequestSchema, passengerSchema } from '@/lib/validations';

export default function MultiStepBooking({ tourId, price, originalPrice, bestDiscount, initialDate = '', initialPassengers = '1' }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    tourId,
    departureScheduleId: '',
    startDate: initialDate,
    endDate: '',
    adultsCount: parseInt(initialPassengers) || 1,
    childrenCount: 0,
    specialRequests: '',
    pickupLocation: '',
    dropoffLocation: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    passengers: [],
    paymentMethod: 'vnpay',
    depositAmount: 0,
    fullAmount: price
  });

  const steps = [
    { id: 1, title: 'Chọn lịch', icon: Calendar },
    { id: 2, title: 'Thông tin hành khách', icon: Users },
    { id: 3, title: 'Thanh toán', icon: CreditCard },
    { id: 4, title: 'Xác nhận', icon: CheckCircle }
  ];

  const handleNextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateBookingData = (field, value) => {
    setBookingData(prev => ({ ...prev, [field]: value }));
  };

  const calculateTotal = () => {
    const basePrice = price || 0;
    const adultsPrice = basePrice * bookingData.adultsCount;
    const childrenPrice = (basePrice * 0.7) * bookingData.childrenCount; // Children pay 70%
    return adultsPrice + childrenPrice;
  };

  const totalAmount = calculateTotal();

  return (
    <div className="space-y-8">
      {/* Progress Steps - Horizontal layout for PC */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, idx) => (
          <div key={step.id} className="flex items-center flex-1">
            <div className={`flex flex-col items-center ${idx < steps.length - 1 ? 'flex-1' : ''}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-base transition-all ${
                currentStep === step.id
                  ? 'bg-blue-600 text-white scale-110'
                  : currentStep > step.id
                  ? 'bg-green-500 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}>
                {currentStep > step.id ? <CheckCircle size={24} /> : step.id}
              </div>
              <span className={`text-sm font-bold mt-2 ${
                currentStep === step.id ? 'text-blue-600' : 'text-slate-400'
              }`}>
                {step.title}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`flex-1 h-1 mx-2 transition-all ${
                currentStep > step.id ? 'bg-green-500' : 'bg-slate-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content - Horizontal layout for PC */}
      <div className="bg-white rounded-2xl p-8 md:p-10 border border-slate-200">
        {currentStep === 1 && (
          <Step1Schedule
            bookingData={bookingData}
            updateBookingData={updateBookingData}
            onNext={handleNextStep}
            tourId={tourId}
          />
        )}
        {currentStep === 2 && (
          <Step2Passengers
            bookingData={bookingData}
            updateBookingData={updateBookingData}
            onNext={handleNextStep}
            onPrevious={handlePreviousStep}
            adultsCount={bookingData.adultsCount}
            childrenCount={bookingData.childrenCount}
          />
        )}
        {currentStep === 3 && (
          <Step3Payment
            bookingData={bookingData}
            updateBookingData={updateBookingData}
            onNext={handleNextStep}
            onPrevious={handlePreviousStep}
            totalAmount={totalAmount}
            bestDiscount={bestDiscount}
          />
        )}
        {currentStep === 4 && (
          <Step4Confirmation
            bookingData={bookingData}
            onPrevious={handlePreviousStep}
            totalAmount={totalAmount}
            bestDiscount={bestDiscount}
            tourId={tourId}
            price={price}
          />
        )}
      </div>
    </div>
  );
}

// Step 1: Schedule Selection
function Step1Schedule({ bookingData, updateBookingData, onNext, tourId }) {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [useCustomDate, setUseCustomDate] = useState(false);
  const [customDate, setCustomDate] = useState(() => bookingData.startDate || '');
  const [tourData, setTourData] = useState(null);

  // Sync customDate with bookingData.startDate only when bookingData.startDate changes from parent
  useEffect(() => {
    if (bookingData.startDate && customDate !== bookingData.startDate) {
      setCustomDate(bookingData.startDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingData.startDate]);

  useEffect(() => {
    fetch(`/api/tours/${tourId}/schedules`)
      .then(res => res.json())
      .then(data => {
        setSchedules(data.schedules || []);
        // If no schedules and user has initial date, auto-enable custom date mode
        if ((!data.schedules || data.schedules.length === 0) && bookingData.startDate) {
          setUseCustomDate(true);
          setCustomDate(bookingData.startDate);
        }
      })
      .finally(() => setLoading(false));
  }, [tourId, bookingData.startDate]);

  useEffect(() => {
    fetch(`/api/tours/${tourId}`)
      .then(res => res.json())
      .then(data => {
        setTourData(data);
      })
      .catch(err => console.error('Error fetching tour data:', err));
  }, [tourId]);

  const handleScheduleSelect = (scheduleId) => {
    const schedule = schedules.find(s => s.id === scheduleId);
    if (schedule) {
      // Check availability before allowing selection
      if (schedule.available_slots < (bookingData.adultsCount + bookingData.childrenCount)) {
        alert('Không đủ chỗ trống cho số lượng hành khách này');
        return;
      }

      const startDate = new Date(schedule.departure_date);
      const endDate = new Date(startDate);
      const durationDays = tourData?.duration_days || 3; // Use tour's duration, fallback to 3 days
      endDate.setDate(endDate.getDate() + durationDays);

      updateBookingData('departureScheduleId', scheduleId);
      updateBookingData('startDate', startDate.toISOString().split('T')[0]);
      updateBookingData('endDate', endDate.toISOString().split('T')[0]);
      setSelectedSchedule(schedule);
      setUseCustomDate(false);
    }
  };

  const handleCustomDateSubmit = () => {
    if (!customDate) {
      alert('Vui lòng chọn ngày khởi hành');
      return false;
    }

    const startDate = new Date(customDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 3); // Default 3 days

    updateBookingData('departureScheduleId', ''); // No schedule ID for custom dates
    updateBookingData('startDate', startDate.toISOString().split('T')[0]);
    updateBookingData('endDate', endDate.toISOString().split('T')[0]);
    setSelectedSchedule({ id: 'custom', departure_date: customDate });
    return true;
  };

  const totalPassengers = bookingData.adultsCount + bookingData.childrenCount;
  const canProceed = (selectedSchedule && selectedSchedule.available_slots >= totalPassengers) || (useCustomDate && customDate);

  // Clear selected schedule if passengers exceed available slots
  useEffect(() => {
    if (selectedSchedule && selectedSchedule.available_slots < totalPassengers) {
      setSelectedSchedule(null);
      updateBookingData('departureScheduleId', '');
    }
  }, [totalPassengers, selectedSchedule, updateBookingData]);

  return (
    <div className="space-y-8">
      <h3 className="text-2xl font-black text-slate-800">Chọn lịch khởi hành</h3>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : schedules.length === 0 || useCustomDate ? (
        <div className="space-y-6">
          <div className="bg-blue-50 p-8 rounded-2xl border-2 border-blue-200">
            <h4 className="font-black text-slate-800 mb-6 flex items-center gap-2 text-lg">
              <Calendar size={20} className="text-blue-600" />
              Chọn ngày khởi hành tùy chỉnh
            </h4>
            <div>
              <label className="text-sm font-black text-slate-600 uppercase mb-3 block">Ngày khởi hành *</label>
              <input
                type="date"
                value={customDate}
                onChange={(e) => {
                  setCustomDate(e.target.value);
                  setUseCustomDate(true); // Auto-enable custom date mode when user selects a date
                }}
                className="w-full px-6 py-5 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-800 text-lg focus:outline-none focus:border-blue-500"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            {schedules.length > 0 && (
              <button
                type="button"
                onClick={() => setUseCustomDate(false)}
                className="mt-6 text-blue-600 font-bold text-base hover:underline"
              >
                ← Quay lại chọn lịch có sẵn
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schedules.map((schedule) => {
            const isAvailable = schedule.available_slots >= totalPassengers;
            const isSelected = bookingData.departureScheduleId === schedule.id;

            return (
              <button
                key={schedule.id}
                onClick={() => isAvailable && handleScheduleSelect(schedule.id)}
                disabled={!isAvailable}
                className={`w-full p-6 rounded-xl border-2 text-left transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50'
                    : isAvailable
                    ? 'border-slate-200 hover:border-blue-300'
                    : 'border-slate-200 bg-slate-100 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="font-black text-slate-800 text-lg">
                    {new Date(schedule.departure_date).toLocaleDateString('vi-VN')}
                  </p>
                  {isAvailable ? (
                    schedule.available_slots > 5 ? (
                      <span className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-black">
                        Còn chỗ
                      </span>
                    ) : (
                      <span className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-black">
                        Sắp hết
                      </span>
                    )
                  ) : (
                    <span className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-black">
                      Hết chỗ
                    </span>
                  )}
                </div>
                <p className="text-slate-600 text-base">
                  {schedule.available_slots} chỗ trống / {schedule.total_slots} tổng
                </p>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setUseCustomDate(true)}
            className="w-full p-6 rounded-xl border-2 border-dashed border-slate-300 text-slate-600 font-bold text-base hover:border-blue-500 hover:text-blue-600 transition-all"
          >
            + Chọn ngày khởi hành tùy chỉnh
          </button>
        </div>
      )}

      {/* Passenger Count */}
      <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-200">
        <div>
          <label className="text-sm font-black text-slate-600 uppercase mb-3 block">Người lớn</label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => updateBookingData('adultsCount', Math.max(1, bookingData.adultsCount - 1))}
              className="w-12 h-12 bg-slate-200 rounded-xl font-black text-slate-700 hover:bg-slate-300 active:scale-95 transition-all text-xl"
            >
              -
            </button>
            <span className="w-12 text-center font-black text-2xl text-slate-900">{bookingData.adultsCount}</span>
            <button
              type="button"
              onClick={() => updateBookingData('adultsCount', bookingData.adultsCount + 1)}
              className="w-12 h-12 bg-slate-200 rounded-xl font-black text-slate-700 hover:bg-slate-300 active:scale-95 transition-all text-xl"
            >
              +
            </button>
          </div>
        </div>
        <div>
          <label className="text-sm font-black text-slate-600 uppercase mb-3 block">Trẻ em</label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => updateBookingData('childrenCount', Math.max(0, bookingData.childrenCount - 1))}
              className="w-12 h-12 bg-slate-200 rounded-xl font-black text-slate-700 hover:bg-slate-300 active:scale-95 transition-all text-xl"
            >
              -
            </button>
            <span className="w-12 text-center font-black text-2xl text-slate-900">{bookingData.childrenCount}</span>
            <button
              type="button"
              onClick={() => updateBookingData('childrenCount', bookingData.childrenCount + 1)}
              className="w-12 h-12 bg-slate-200 rounded-xl font-black text-slate-700 hover:bg-slate-300 active:scale-95 transition-all text-xl"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Availability Warning */}
      {selectedSchedule && selectedSchedule.available_slots < totalPassengers && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-red-700 font-bold">
            <AlertCircle size={20} />
            <span>Không đủ chỗ trống cho {totalPassengers} hành khách</span>
          </div>
        </div>
      )}

      <button
        onClick={() => {
          if (useCustomDate) {
            const success = handleCustomDateSubmit();
            if (!success) return;
          }
          onNext();
        }}
        disabled={!canProceed}
        className="w-full bg-blue-600 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
      >
        Tiếp tục <ChevronRight size={18} />
      </button>
    </div>
  );
}

// Step 2: Passenger Details
function Step2Passengers({ bookingData, updateBookingData, onNext, onPrevious, adultsCount, childrenCount }) {
  const [passengers, setPassengers] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const totalPassengers = adultsCount + childrenCount;
    const newPassengers = Array.from({ length: totalPassengers }, (_, i) => ({
      id: i,
      fullName: '',
      birthDate: '',
      gender: 'Nam',
      phoneNumber: '',
      isChild: i >= adultsCount
    }));
    setPassengers(newPassengers);
  }, [adultsCount, childrenCount]);

  const handlePassengerChange = (index, field, value) => {
    const updatedPassengers = [...passengers];
    updatedPassengers[index][field] = value;
    setPassengers(updatedPassengers);
    updateBookingData('passengers', updatedPassengers);
    
    // Clear error for this field
    setErrors(prev => ({ ...prev, [`${index}-${field}`]: null }));
  };

  const validatePassenger = (passenger, index) => {
    const result = passengerSchema.safeParse(passenger);
    if (!result.success) {
      const fieldErrors = {};
      if (result.error && result.error.errors) {
        result.error.errors.forEach(err => {
          const path = err.path[0];
          fieldErrors[`${index}-${path}`] = err.message;
        });
      }
      return fieldErrors;
    }
    return {};
  };

  const validateCustomerInfo = () => {
    const errors = {};
    if (!bookingData.customerName || bookingData.customerName.trim().length < 2) {
      errors.customerName = 'Họ tên phải từ 2 ký tự';
    }
    if (!bookingData.customerPhone || !/^[0-9]{10}$/.test(bookingData.customerPhone)) {
      errors.customerPhone = 'Số điện thoại phải 10 số';
    }
    if (bookingData.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookingData.customerEmail)) {
      errors.customerEmail = 'Email không đúng định dạng';
    }
    return errors;
  };

  const handleNext = () => {
    const newErrors = validateCustomerInfo();
    
    passengers.forEach((passenger, idx) => {
      const passengerErrors = validatePassenger(passenger, idx);
      Object.assign(newErrors, passengerErrors);
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onNext();
    }
  };

  const isFormValid = passengers.every(p => {
    // Adults require phone number, children don't
    if (p.isChild) {
      return p.fullName && p.birthDate;
    }
    return p.fullName && p.birthDate && p.phoneNumber;
  }) && bookingData.customerName && bookingData.customerPhone;

  return (
    <div className="space-y-8">
      <h3 className="text-2xl font-black text-slate-800">Thông tin hành khách</h3>

      {/* Customer Information - Horizontal Layout */}
      <div className="bg-blue-50 p-8 rounded-2xl border-2 border-blue-200">
        <h4 className="font-black text-slate-800 mb-6 flex items-center gap-2 text-lg">
          <Users size={20} className="text-blue-600" />
          Thông tin người đặt
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="text-sm font-black text-slate-600 uppercase mb-3 block">Họ tên người đặt *</label>
            <input
              type="text"
              value={bookingData.customerName}
              onChange={(e) => {
                updateBookingData('customerName', e.target.value);
                setErrors(prev => ({ ...prev, customerName: null }));
              }}
              className={`w-full px-6 py-5 bg-white border-2 rounded-xl font-bold text-slate-800 text-lg focus:outline-none focus:border-blue-500 ${errors.customerName ? 'border-red-500' : 'border-slate-300'}`}
              placeholder="Nhập họ tên người đặt"
            />
            {errors.customerName && <p className="text-red-600 text-sm mt-2 font-bold">{errors.customerName}</p>}
          </div>
          <div>
            <label className="text-sm font-black text-slate-600 uppercase mb-3 block">Số điện thoại *</label>
            <input
              type="tel"
              value={bookingData.customerPhone}
              onChange={(e) => {
                updateBookingData('customerPhone', e.target.value);
                setErrors(prev => ({ ...prev, customerPhone: null }));
              }}
              className={`w-full px-6 py-5 bg-white border-2 rounded-xl font-bold text-slate-800 text-lg focus:outline-none focus:border-blue-500 ${errors.customerPhone ? 'border-red-500' : 'border-slate-300'}`}
              placeholder="Nhập số điện thoại"
            />
            {errors.customerPhone && <p className="text-red-600 text-sm mt-2 font-bold">{errors.customerPhone}</p>}
          </div>
          <div>
            <label className="text-sm font-black text-slate-600 uppercase mb-3 block">Email</label>
            <input
              type="email"
              value={bookingData.customerEmail}
              onChange={(e) => {
                updateBookingData('customerEmail', e.target.value);
                setErrors(prev => ({ ...prev, customerEmail: null }));
              }}
              className={`w-full px-6 py-5 bg-white border-2 rounded-xl font-bold text-slate-800 text-lg focus:outline-none focus:border-blue-500 ${errors.customerEmail ? 'border-red-500' : 'border-slate-300'}`}
              placeholder="Nhập email (tùy chọn)"
            />
            {errors.customerEmail && <p className="text-red-600 text-sm mt-2 font-bold">{errors.customerEmail}</p>}
          </div>
        </div>
      </div>

      {/* Passenger Information - Horizontal Layout */}
      <div className="space-y-6">
        {passengers.map((passenger, idx) => (
          <div key={idx} className="bg-white p-8 rounded-2xl border-2 border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-slate-200">
              <Users size={24} className="text-blue-600" />
              <p className="font-black text-slate-800 text-xl">
                {passenger.isChild ? `Trẻ em ${idx - adultsCount + 1}` : `Người lớn ${idx + 1}`}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-black text-slate-600 uppercase mb-3 block">Họ tên *</label>
                <input
                  type="text"
                  value={passenger.fullName}
                  onChange={(e) => handlePassengerChange(idx, 'fullName', e.target.value)}
                  className={`w-full px-6 py-5 bg-white border-2 rounded-xl font-bold text-slate-800 text-lg focus:outline-none focus:border-blue-500 ${errors[`${idx}-fullName`] ? 'border-red-500' : 'border-slate-300'}`}
                  placeholder="Nhập họ tên"
                />
                {errors[`${idx}-fullName`] && <p className="text-red-600 text-sm mt-2 font-bold">{errors[`${idx}-fullName`]}</p>}
              </div>
              <div>
                <label className="text-sm font-black text-slate-600 uppercase mb-3 block">Ngày sinh *</label>
                <input
                  type="date"
                  value={passenger.birthDate}
                  onChange={(e) => handlePassengerChange(idx, 'birthDate', e.target.value)}
                  className={`w-full px-6 py-5 bg-white border-2 rounded-xl font-bold text-slate-800 text-lg focus:outline-none focus:border-blue-500 ${errors[`${idx}-birthDate`] ? 'border-red-500' : 'border-slate-300'}`}
                />
                {errors[`${idx}-birthDate`] && <p className="text-red-600 text-sm mt-2 font-bold">{errors[`${idx}-birthDate`]}</p>}
              </div>
              <div>
                <label className="text-sm font-black text-slate-600 uppercase mb-3 block">Giới tính *</label>
                <select
                  value={passenger.gender}
                  onChange={(e) => handlePassengerChange(idx, 'gender', e.target.value)}
                  className="w-full px-6 py-5 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-800 text-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-black text-slate-600 uppercase mb-3 block">Số điện thoại *</label>
                <input
                  type="tel"
                  value={passenger.phoneNumber}
                  onChange={(e) => handlePassengerChange(idx, 'phoneNumber', e.target.value)}
                  className={`w-full px-6 py-5 bg-white border-2 rounded-xl font-bold text-slate-800 text-lg focus:outline-none focus:border-blue-500 ${errors[`${idx}-phoneNumber`] ? 'border-red-500' : 'border-slate-300'}`}
                  placeholder="Nhập số điện thoại"
                  disabled={passenger.isChild}
                />
                {errors[`${idx}-phoneNumber`] && <p className="text-red-600 text-sm mt-2 font-bold">{errors[`${idx}-phoneNumber`]}</p>}
                {passenger.isChild && <p className="text-slate-500 text-sm mt-2">Trẻ em không cần số điện thoại</p>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Special Requests */}
      <div className="bg-white p-8 rounded-2xl border-2 border-slate-200 shadow-sm">
        <label className="text-sm font-black text-slate-600 uppercase mb-3 block">Yêu cầu đặc biệt (tùy chọn)</label>
        <textarea
          value={bookingData.specialRequests}
          onChange={(e) => updateBookingData('specialRequests', e.target.value)}
          className="w-full px-6 py-5 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-800 text-lg focus:outline-none focus:border-blue-500 resize-none"
          rows={4}
          placeholder="Nhập yêu cầu đặc biệt (nếu có)"
        />
      </div>

      <div className="flex gap-4">
        <button
          onClick={onPrevious}
          className="flex-1 bg-slate-200 text-slate-700 py-5 rounded-xl font-black text-base uppercase tracking-widest hover:bg-slate-300 transition-all flex items-center justify-center gap-2"
        >
          <ChevronLeft size={20} /> Quay lại
        </button>
        <button
          onClick={handleNext}
          disabled={!isFormValid}
          className="flex-1 bg-blue-600 text-white py-5 rounded-xl font-black text-base uppercase tracking-widest hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          Tiếp tục <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}

// Step 3: Payment
function Step3Payment({ bookingData, updateBookingData, onNext, onPrevious, totalAmount, bestDiscount }) {
  const [paymentMethod, setPaymentMethod] = useState('vnpay');
  const [depositOption, setDepositOption] = useState('full');

  const depositAmount = totalAmount * 0.3; // 30% deposit
  const remainingAmount = totalAmount - depositAmount;

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    updateBookingData('paymentMethod', method);
  };

  const handleDepositOptionChange = (option) => {
    setDepositOption(option);
    if (option === 'deposit') {
      updateBookingData('depositAmount', depositAmount);
    } else {
      updateBookingData('depositAmount', 0);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-black text-slate-800">Phương thức thanh toán</h3>
      
      {/* Payment Methods */}
      <div className="space-y-3">
        {[
          { id: 'vnpay', name: 'VNPay', icon: '💳' },
          { id: 'qr', name: 'QR Code', icon: '📱' },
          { id: 'bank_transfer', name: 'Chuyển khoản', icon: '🏦' }
        ].map((method) => (
          <button
            key={method.id}
            onClick={() => handlePaymentMethodChange(method.id)}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${
              paymentMethod === method.id
                ? 'border-blue-600 bg-blue-50'
                : 'border-slate-200 hover:border-blue-300'
            }`}
          >
            <span className="text-2xl">{method.icon}</span>
            <span className="font-black text-slate-800">{method.name}</span>
            {paymentMethod === method.id && (
              <CheckCircle className="ml-auto text-blue-600" size={20} />
            )}
          </button>
        ))}
      </div>

      {/* Deposit Option */}
      <div className="bg-slate-50 p-6 rounded-xl">
        <h4 className="font-black text-slate-800 mb-4">Lựa chọn thanh toán</h4>
        <div className="space-y-3">
          <button
            onClick={() => handleDepositOptionChange('full')}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
              depositOption === 'full'
                ? 'border-blue-600 bg-blue-50'
                : 'border-slate-200 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-black text-slate-800">Thanh toán đầy đủ</p>
                <p className="text-slate-600 text-sm">Thanh toán 100% ngay bây giờ</p>
              </div>
              <div className="text-right">
                <p className="font-black text-blue-600 text-xl">{totalAmount.toLocaleString()}đ</p>
              </div>
            </div>
          </button>
          <button
            onClick={() => handleDepositOptionChange('deposit')}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
              depositOption === 'deposit'
                ? 'border-blue-600 bg-blue-50'
                : 'border-slate-200 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-black text-slate-800">Đặt cọc 30%</p>
                <p className="text-slate-600 text-sm">Thanh toán cọc, còn lại trước ngày khởi hành</p>
              </div>
              <div className="text-right">
                <p className="font-black text-blue-600 text-xl">{depositAmount.toLocaleString()}đ</p>
                <p className="text-slate-500 text-xs">Còn lại: {remainingAmount.toLocaleString()}đ</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-slate-900 p-6 rounded-xl text-white">
        <h4 className="font-black mb-4">Tóm tắt đặt tour</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Giá tour</span>
            <span>{totalAmount.toLocaleString()}đ</span>
          </div>
          {bestDiscount && (
            <div className="flex justify-between text-green-400">
              <span>Giảm giá</span>
              <span>-{bestDiscount.discount_amount.toLocaleString()}đ</span>
            </div>
          )}
          <div className="flex justify-between font-black text-lg pt-2 border-t border-slate-700">
            <span>Tổng thanh toán</span>
            <span className="text-blue-400">
              {(depositOption === 'deposit' ? depositAmount : totalAmount).toLocaleString()}đ
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={onPrevious}
          className="flex-1 bg-slate-200 text-slate-700 py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-slate-300 transition-all flex items-center justify-center gap-2"
        >
          <ChevronLeft size={18} /> Quay lại
        </button>
        <button
          onClick={onNext}
          className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
        >
          Xác nhận <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

// Step 4: Confirmation & Submission
function Step4Confirmation({ bookingData, onPrevious, totalAmount, bestDiscount, tourId, price }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);

  const handleSubmitBooking = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Prepare booking data
      const bookingPayload = {
        tourId: parseInt(tourId),
        departureScheduleId: bookingData.departureScheduleId ? parseInt(bookingData.departureScheduleId) : null,
        amount: totalAmount,
        customerName: bookingData.customerName || '',
        phone: bookingData.customerPhone || '',
        email: bookingData.customerEmail || '',
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
        adultsCount: bookingData.adultsCount,
        childrenCount: bookingData.childrenCount,
        passengers: bookingData.passengers || [],
        specialRequests: bookingData.specialRequests || '',
        pickupLocation: bookingData.pickupLocation || '',
        dropoffLocation: bookingData.dropoffLocation || ''
      };

      console.log('Booking payload:', JSON.stringify(bookingPayload, null, 2));

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingPayload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.details || 'Đặt tour thất bại');
      }

      setBookingResult(result.booking);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi đặt tour');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-white" size={40} />
          </div>
          <h3 className="text-2xl font-black text-slate-800 mb-2">Đặt tour thành công!</h3>
          <p className="text-slate-600">Chúng tôi đã nhận được đặt tour của bạn</p>
        </div>

        <div className="bg-slate-50 p-6 rounded-xl">
          <h4 className="font-black text-slate-800 mb-4">Thông tin đặt tour</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Mã đặt tour</span>
              {/* eslint-disable-next-line react-hooks/purity */}
              <span className="font-black">#{bookingResult?.id || 'BK' + Date.now()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Khách hàng</span>
              <span className="font-black">{bookingResult?.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Tour</span>
              <span className="font-black">{bookingResult?.tourTitle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Ngày khởi hành</span>
              <span className="font-black">{bookingResult?.startDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Số hành khách</span>
              <span className="font-black">{bookingData.adultsCount + bookingData.childrenCount} người</span>
            </div>
            <div className="flex justify-between font-black text-lg pt-2 border-t border-slate-200">
              <span>Tổng thanh toán</span>
              <span className="text-blue-600">{totalAmount.toLocaleString()}đ</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => window.location.href = '/my-bookings'}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all min-h-[56px] touch-manipulation"
        >
          Xem đặt tour của tôi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      <div className="text-center py-8">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="text-blue-600" size={40} />
        </div>
        <h3 className="text-2xl font-black text-slate-800 mb-2">Xác nhận đặt tour</h3>
        <p className="text-slate-600">Vui lòng kiểm tra thông tin trước khi đặt</p>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-red-700 font-bold">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="bg-slate-50 p-8 rounded-2xl">
        <h4 className="font-black text-slate-800 mb-6 text-lg">Thông tin đặt tour</h4>
        <div className="space-y-4 text-base">
          <div className="flex justify-between items-center py-2 border-b border-slate-200">
            <span className="text-slate-600 font-medium">Ngày khởi hành</span>
            <span className="font-black text-slate-800">{bookingData.startDate}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-200">
            <span className="text-slate-600 font-medium">Ngày kết thúc</span>
            <span className="font-black text-slate-800">{bookingData.endDate}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-200">
            <span className="text-slate-600 font-medium">Số người lớn</span>
            <span className="font-black text-slate-800">{bookingData.adultsCount} người</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-200">
            <span className="text-slate-600 font-medium">Số trẻ em</span>
            <span className="font-black text-slate-800">{bookingData.childrenCount} trẻ em</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-200">
            <span className="text-slate-600 font-medium">Tổng hành khách</span>
            <span className="font-black text-slate-800">{bookingData.adultsCount + bookingData.childrenCount} người</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-200">
            <span className="text-slate-600 font-medium">Phương thức thanh toán</span>
            <span className="font-black text-slate-800">{bookingData.paymentMethod === 'vnpay' ? 'VNPay' : bookingData.paymentMethod === 'qr' ? 'QR Code' : 'Chuyển khoản'}</span>
          </div>
          {bookingData.specialRequests && (
            <div className="flex justify-between items-center py-2 border-b border-slate-200">
              <span className="text-slate-600 font-medium">Yêu cầu đặc biệt</span>
              <span className="font-black text-slate-800">{bookingData.specialRequests}</span>
            </div>
          )}
          <div className="flex justify-between items-center py-4 font-black text-xl">
            <span className="text-slate-800">Tổng thanh toán</span>
            <span className="text-blue-600">{totalAmount.toLocaleString()}đ</span>
          </div>
        </div>
      </div>

      {/* Mobile Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 md:hidden z-50 shadow-lg">
        <div className="flex gap-3">
          <button
            onClick={onPrevious}
            disabled={isSubmitting}
            className="flex-1 bg-slate-200 text-slate-700 py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-slate-300 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[56px] touch-manipulation"
          >
            <ChevronLeft size={18} /> Quay lại
          </button>
          <button
            onClick={handleSubmitBooking}
            disabled={isSubmitting}
            className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 min-h-[56px] touch-manipulation"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Đang xử lý...
              </>
            ) : (
              <>
                Xác nhận đặt tour <ChevronRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Desktop Buttons */}
      <div className="hidden md:flex gap-4">
        <button
          onClick={onPrevious}
          disabled={isSubmitting}
          className="flex-1 bg-slate-200 text-slate-700 py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-slate-300 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={18} /> Quay lại
        </button>
        <button
          onClick={handleSubmitBooking}
          disabled={isSubmitting}
          className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Đang xử lý...
            </>
          ) : (
            <>
              Xác nhận đặt tour <ChevronRight size={18} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
