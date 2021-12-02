/// <summary>
/// Form On Load functions
/// </summary>
/// <param name="executionContext">Execution Context</param>
function OnLoadAccount(executionContext) {
    "use strict";
    try {
        if (executionContext === null || executionContext === undefined)
            return;
        var formContext = executionContext.getFormContext();
        if (formContext === null || formContext === undefined)
            return;

        var formType = formContext.ui.getFormType();
        if (formType === 1) {
            var ownerIdLookup = formContext.getAttribute("ownerid").getValue();

        } else {
            if (formContext.getAttribute("negt_ownerid") !== null && formContext.getAttribute("negt_ownerid") !== undefined) {
                var ownerIdLookup = formContext.getAttribute("negt_ownerid").getValue();
            }
        }

        SetCacheForMultilingualMessages();
        SetDefaultCountry(executionContext);
        CallActionToCalculateFields(executionContext);
        // SetDefaultTerritory(executionContext);
        RemoveCustomerFromAccountType(executionContext);
        LockFieldsBasedOnRole(executionContext);
        // added by gurpreet to hanlde the country based fields hide/show
        HideAndShowBasedOnUserCountry(executionContext);
        SetIsResyncFalse(executionContext);
        //SetDefaultCountry(executionContext);

        var countryId = getCountryOfOwner(formContext, ownerIdLookup);

        FilterContactLookup(formContext, countryId);
        FilterAccountVertical(formContext, countryId);
        HideAndShowParentAccountStatisticsFields(executionContext);
       


    } catch (e) {
        var exMsg = "";
        if (typeof(Storage) !== "undefined") {
            exMsg = sessionStorage.getItem("M2");
        } else {
            exMsg = GetMessageText("M2");
        }

        if (exMsg === "" || exMsg === null) {
            exMsg = GetMessageText("M2");
        }
        Xrm.Navigation.openAlertDialog({
            text: exMsg
        });
    }
}

/// <summary>
/// Retrive country of owner
/// </summary>
/// <param name="executionContext">Execution Context</param>
function getCountryOfOwner(formContext, ownerIdLookup) {

    var countryId = "";
    try {
        if (ownerIdLookup !== null) {
            var ownerId = ownerIdLookup[0].id;
            ownerId = ownerId.replace("}", "").replace("{", "");
            var query = "systemusers?$select=_negt_countryid_value&$filter=systemuserid eq " + ownerId;
            var userData = GetData(query);
            if (userData !== null && userData !== undefined) {
                if (userData.value !== undefined) {
                    if (userData.value.length > 0) {
                        if (userData.value[0]["_negt_countryid_value"] !== null && userData.value[0]["_negt_countryid_value"] !== undefined) {
                            countryId = userData.value[0]["_negt_countryid_value"];
                        }
                    }
                }
            }
        }
    } catch (ex) {
        Xrm.Navigation.openAlertDialog({
            text: "An error occurred while getOwnerCountry."
        });
    }
    return countryId;
}
/// <summary>
/// Form On Load functions
/// </summary>
/// <param name="executionContext">Execution Context</param>
function OnLoadAccountQuickCreate(executionContext) {
    "use strict";
    try {
        SetCacheForMultilingualMessages();
        RemoveCustomerFromAccountType(executionContext);
        HideAndShowBasedOnUserCountry(executionContext);

        if (executionContext === null || executionContext === undefined)
            return;
        var formContext = executionContext.getFormContext();
        if (formContext === null || formContext === undefined)
            return;

        var formType = formContext.ui.getFormType();
        if (formType === 1) {
            var ownerIdLookup = formContext.getAttribute("ownerid").getValue();

        } else {
            if (formContext.getAttribute("negt_ownerid") !== null && formContext.getAttribute("negt_ownerid") !== undefined) {
                var ownerIdLookup = formContext.getAttribute("negt_ownerid").getValue();
            }
        }
        var countryId = getCountryOfOwner(formContext, ownerIdLookup);
        FilterContactLookup(formContext, countryId);
    } catch (e) {
        var exMsg = "";
        if (typeof(Storage) !== "undefined") {
            exMsg = sessionStorage.getItem("M2");
        } else {
            exMsg = GetMessageText("M2");
        }

        if (exMsg === "" || exMsg === null) {
            exMsg = GetMessageText("M2");
        }
        Xrm.Navigation.openAlertDialog({
            text: exMsg
        });
    }
}
/// <summary>
/// Common function to check if specified role is found or not
/// </summary>
/// <param name="rolesToCheck">Security role array</param>
function CheckUserRole(rolesToCheck) {
    "use strict";
    try {

        var isFound = false;
        if (rolesToCheck.length > 0) {
            for (var v = 0; v < rolesToCheck.length; v++) {
                const matchingRoles = Xrm.Utility.getGlobalContext().userSettings.roles.get(function (role) {
                    return role.name.toLowerCase() === rolesToCheck[v].toLowerCase();
                });
                if (matchingRoles.length > 0)
                    isFound = true;
            }
        }
        return isFound;
    } catch (error) {
        var exMsg = "";
        if (typeof(Storage) !== "undefined") {
            exMsg = sessionStorage.getItem("M7");
        } else {
            exMsg = GetMessageText("M7");
        }
        if (exMsg === "" || exMsg === null) {
            exMsg = GetMessageText("M7");
        }
        Xrm.Navigation.openAlertDialog({
            text: exMsg
        });
    }
}

function LockFieldsBasedOnRole(executionContext) {

    "use strict";
    try {

        if (executionContext === null || executionContext === undefined)
            return;
        var formContext = executionContext.getFormContext();
        if (formContext === null || formContext === undefined)
            return;

        var roles = KEYACCROLES;
        var roleFound = CheckUserRole(roles);

        var isKeyAccount = formContext.getAttribute("negt_iskeyaccount").getValue();

        if (!roleFound && isKeyAccount) {
            DisableAllFields(executionContext, true);
        }

    } catch (e) {
        var exMsg = "";
        if (typeof(Storage) !== "undefined") {
            exMsg = sessionStorage.getItem("M85");
        } else {
            exMsg = GetMessageText("M85");
        }
        if (exMsg === "" || exMsg === null) {
            exMsg = GetMessageText("M85");
        }
        Xrm.Navigation.openAlertDialog({
            text: exMsg
        });
    }
}

/// <summary>
/// Disable all fields
/// </summary>
/// <param name="executionContext">executionContext</param>
function DisableAllFields(executionContext, flag) {
    "use strict";

    if (executionContext === null || executionContext === undefined)
        return;
    var formContext = executionContext.getFormContext();
    if (formContext === null || formContext === undefined)
        return;
    setTimeout(function () {
        formContext.ui.controls.forEach(function (control) {
            if (control && control.getDisabled && !control.getDisabled()) {
                control.setDisabled(flag);
            }
        });
    }, 1000);

}

/// <summary>
/// common function to retrieve the data through api call
/// </summary>
/// <param name="query">Query to pass in api call</param>
function GetData(query) {
    "use strict";
    try {
        var data = {};
        var serverURL = Xrm.Utility.getGlobalContext().getClientUrl();
        var req = new XMLHttpRequest();
        req.open("GET", serverURL + RESTAPIVERSION + query, false); // need synchronus result for example - roles name
        req.setRequestHeader("Accept", "application/json");
        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        req.setRequestHeader("OData-MaxVersion", "4.0");
        req.setRequestHeader("OData-Version", "4.0");
        req.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
        req.onreadystatechange = function () {
            if (this.readyState === 4) {
                req.onreadystatechange = null;
                if (this.status === 200) {
                    data = JSON.parse(this.responseText);
                    return data;
                } else {
                    var error = JSON.parse(this.responseText).error;
                    Xrm.Navigation.openAlertDialog({
                        text: error.message
                    });
                }
            }
        };
        req.send();
        return data;
    } catch (error) {
        var exMsg = "";
        if (typeof(Storage) !== "undefined") {
            exMsg = sessionStorage.getItem("M8");
        } else {
            exMsg = GetMessageText("M8");
        }
        if (exMsg === "" || exMsg === null) {
            exMsg = GetMessageText("M8");
        }
        Xrm.Navigation.openAlertDialog({
            text: exMsg
        });
    }
}

/// <summary>
/// Fill State text field on change of State lookup
/// </summary>
/// <param name="executionContext">Execution Context</param>
function OnStateChange(executionContext) {
    "use strict";
    try {

        if (executionContext === null || executionContext === undefined)
            return;
        var formContext = executionContext.getFormContext();
        if (formContext === null || formContext === undefined)
            return;

        var state = formContext.getAttribute("negt_stateid").getValue();
        if (state !== null && state !== undefined) {
            var stateName = state[0].name;
            formContext.getAttribute('address1_stateorprovince').setValue(stateName);
            SetCompositeAddressField(executionContext);
        }

    } catch (e) {
        var exMsg = "";
        if (typeof(Storage) !== "undefined") {
            exMsg = sessionStorage.getItem("M9");
        } else {
            exMsg = GetMessageText("M9");
        }
        if (exMsg === "" || exMsg === null) {
            exMsg = GetMessageText("M9");
        }
        Xrm.Navigation.openAlertDialog({
            text: exMsg
        });
    }
}

/// <summary>
/// Fill State lookup on change of State text field
/// </summary>
/// <param name="executionContext">Execution Context</param>
function OnStateTextFieldChange(executionContext) {
    "use strict";
    try {
        if (executionContext === null || executionContext === undefined)
            return;
        var formContext = executionContext.getFormContext();
        if (formContext === null || formContext === undefined)
            return;

        var state = formContext.getAttribute("negt_stateid").getValue();
        var stateTextField = formContext.getAttribute("address1_stateorprovince").getValue();
        if (stateTextField !== null && stateTextField !== undefined) {
            if (state !== null && state !== undefined) {
                var stateName = state[0].name;
            }
            if (stateTextField !== stateName) {
                var query = "negt_states?$select=negt_stateid&$filter=negt_name eq '" + stateTextField + "'";
                var stateData = GetData(query);
                if (stateData !== null && stateData !== undefined) {
                    if (stateData.value !== undefined) {
                        if (stateData.value.length > 0) {
                            var newStateId = stateData.value[0]["negt_stateid"];
                            formContext.getAttribute("negt_stateid").setValue([{
                                        id: newStateId,
                                        name: stateTextField,
                                        entityType: "negt_state"
                                    }
                                ]);
                            SetCompositeAddressField(executionContext);
                        } else {
                            formContext.getAttribute('negt_stateid').setValue(null);
                            //formContext.getControl('negt_stateid').setVisible(true);

                            if (formContext.getAttribute('negt_countryid').getValue() !== null) {
                                formContext.getAttribute('negt_stateid').setRequiredLevel("required");
                            } else {
                                formContext.getAttribute('negt_stateid').setRequiredLevel("required");
                            }
                        }
                    } else {
                        formContext.getAttribute('negt_stateid').setValue(null);
                        //formContext.getControl('negt_stateid').setVisible(true);

                        if (formContext.getAttribute('negt_countryid').getValue() !== null) {
                            formContext.getAttribute('negt_stateid').setRequiredLevel("required");
                        } else {
                            formContext.getAttribute('negt_stateid').setRequiredLevel("required");
                        }
                    }
                } else {
                    formContext.getAttribute('negt_stateid').setValue(null);
                    //formContext.getControl('negt_stateid').setVisible(true);

                    if (formContext.getAttribute('negt_countryid').getValue() !== null) {
                        formContext.getAttribute('negt_stateid').setRequiredLevel("required");
                    } else {
                        formContext.getAttribute('negt_stateid').setRequiredLevel("required");
                    }
                }
            }
        }
    } catch (e) {
        var exMsg = "";
        if (typeof(Storage) !== "undefined") {
            exMsg = sessionStorage.getItem("M9");
        } else {
            exMsg = GetMessageText("M9");
        }
        if (exMsg === "" || exMsg === null) {
            exMsg = GetMessageText("M9");
        }

        Xrm.Navigation.openAlertDialog({
            text: exMsg
        });
    }
}

/// <summary>
/// Call action OTISNEGTActionAccountCalculateFieldData to calculate Account fields
/// </summary>
/// <param name="executionContext">Execution Context</param>
function CallActionToCalculateFields(executionContext) {

    "use strict";
    try {

        if (executionContext === null || executionContext === undefined)
            return;
        var formContext = executionContext.getFormContext();

        if (formContext === null || formContext === undefined)
            return;

        var RoleArray = [];
        var GetRole = GetConfigValue(executionContext, "negt_value", "AuditorRole");

        if (GetRole !== null && GetRole !== undefined) {
            if (GetRole.value !== undefined) {
                if (GetRole.value.length > 0) {
                    if (GetRole.value[0]["negt_value"] !== null && GetRole.value[0]["negt_value"] !== undefined) {
                        RoleArray = GetRole.value[0]["negt_value"].split(',');
                    }
                }
            }
        }

        var flag = false;

        if (RoleArray.length > 0) {
            for (var j = 0; j < RoleArray.length; j++) {
                const matchingRoles = Xrm.Utility.getGlobalContext().userSettings.roles.get(function (role) {
                    return role.name.toLowerCase() === RoleArray[j].toLowerCase();
                });
                if (matchingRoles.length > 0) {
                    flag = true;
                }
            }
        }

        if (flag == false) {
            var formType = formContext.ui.getFormType();
            if (formType === 2 || formType === 3) {
                var id = formContext.data.entity.getId();
                id = id.replace("{", "");
                id = id.replace("}", "");
                var req = new XMLHttpRequest();
                req.open("POST", Xrm.Utility.getGlobalContext().getClientUrl() + RESTAPIVERSION + "accounts(" + id + ")/Microsoft.Dynamics.CRM.negt_OTISNEGTActionAccountCalculateFieldData", true);
                req.setRequestHeader("OData-MaxVersion", "4.0");
                req.setRequestHeader("OData-Version", "4.0");
                req.setRequestHeader("Accept", "application/json");
                req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
                req.onreadystatechange = function () {
                    if (this.readyState === 4) {
                        req.onreadystatechange = null;
                        if (this.status === 204 || this.status === 200) {
                            //Success - No Return Data - Do Something
                        } else {
                            Xrm.Navigation.openAlertDialog({
                                text: GetMessageText("M10")
                            });
                        }
                    }
                };
                req.send();
            }
        }
    } catch (e) {
        var exMsg = "";
        if (typeof(Storage) !== "undefined") {
            exMsg = sessionStorage.getItem("M10");
        } else {
            exMsg = GetMessageText("M10");
        }
        if (exMsg === "" || exMsg === null) {
            exMsg = GetMessageText("M10");
        }
        Xrm.Navigation.openAlertDialog({
            text: exMsg
        });
    }
}

/// <summary>
/// Fill Country text field on change of Country lookup
/// </summary>
/// <param name="executionContext">Execution Context</param>
function OnCountryChange(executionContext) {
    "use strict";

    try {
        if (executionContext === null || executionContext === undefined)
            return;
        var formContext = executionContext.getFormContext();
        if (formContext === null || formContext === undefined)
            return;

        var country = formContext.getAttribute("negt_countryid").getValue();
        if (country !== null && country !== undefined) {
            var countryName = country[0].name;
            formContext.getAttribute('address1_country').setValue(countryName);
            var stateLookup = formContext.getAttribute("negt_stateid").getValue();
            if (stateLookup !== null && stateLookup !== undefined) {
                var stateQuery = "negt_states?$filter=_negt_countryid_value eq " + country[0].id + " and  negt_stateid eq '" + stateLookup[0].id + "'";
                var stateData = GetData(stateQuery);
                if (stateData === null || stateData === undefined) {
                    formContext.getAttribute('negt_stateid').setValue(null);
                    formContext.getAttribute('negt_stateid').setRequiredLevel("required");
                } else if (stateData.value.length === 0) {
                    formContext.getAttribute('negt_stateid').setValue(null);
                    formContext.getAttribute('negt_stateid').setRequiredLevel("required");
                }
            }
            if (formContext.getAttribute('negt_accountverticalid') !== null && formContext.getAttribute('negt_accountverticalid') !== undefined) {
                formContext.getAttribute('negt_accountverticalid').setValue(null);
            }

            SetCompositeAddressField(executionContext);
        }
        formContext.getAttribute('negt_stateid').setValue(null);

    } catch (e) {
        var exMsg = "";
        if (typeof(Storage) !== "undefined") {
            exMsg = sessionStorage.getItem("M11");
        } else {
            exMsg = GetMessageText("M11");
        }
        if (exMsg === "" || exMsg === null) {
            exMsg = GetMessageText("M11");
        }
        Xrm.Navigation.openAlertDialog({
            text: exMsg
        });
    }
}

/// <summary>
/// Fill Country lookup on change of Country text field
/// </summary>
/// <param name="executionContext">Execution Context</param>
function OnCountryTextFieldChange(executionContext) {
    "use strict";
    try {
        if (executionContext === null || executionContext === undefined)
            return;
        var formContext = executionContext.getFormContext();
        if (formContext === null || formContext === undefined)
            return;

        var country = formContext.getAttribute("negt_countryid").getValue();
        var countryTextField = formContext.getAttribute("address1_country").getValue();
        if (countryTextField !== null && countryTextField !== undefined) {
            if (country !== null && country !== undefined) {
                var countryName = country[0].name;
            }

            if (countryTextField !== countryName) {
                var query = "negt_countries?$select=negt_countryid&$filter=negt_name eq '" + countryTextField + "'";
                var userData = GetData(query);
                if (userData !== null && userData !== undefined) {
                    if (userData.value !== undefined) {
                        if (userData.value.length > 0) {
                            var newCountryId = userData.value[0]["negt_countryid"];
                            formContext.getAttribute("negt_countryid").setValue([{
                                        id: newCountryId,
                                        name: countryTextField,
                                        entityType: "negt_country"
                                    }
                                ]);
                            SetCompositeAddressField(executionContext);
                        } else {
                            formContext.getAttribute('negt_countryid').setValue(null);
                            //formContext.getControl('negt_countryid').setVisible(true);
                            formContext.getAttribute('negt_countryid').setRequiredLevel("required");
                        }
                    } else {
                        formContext.getAttribute('negt_countryid').setValue(null);
                        //formContext.getControl('negt_countryid').setVisible(true);
                        formContext.getAttribute('negt_countryid').setRequiredLevel("required");
                    }
                } else {
                    formContext.getAttribute('negt_countryid').setValue(null);
                    //formContext.getControl('negt_countryid').setVisible(true);
                    formContext.getAttribute('negt_countryid').setRequiredLevel("required");
                }
            }
        }
    } catch (e) {
        var exMsg = "";
        if (typeof(Storage) !== "undefined") {
            exMsg = sessionStorage.getItem("M11");
        } else {
            exMsg = GetMessageText("M11");
        }

        if (exMsg === "" || exMsg === null) {
            exMsg = GetMessageText("M11");
        }

        Xrm.Navigation.openAlertDialog({
            text: exMsg
        });
    }
}

/// <summary>
/// Reterive stateid and statename by state name and set lookup field value.
/// </summary>
/// <param name="msgKey">Message Key</param>
function GetMessageText(msgKey) {
    "use strict";
    try {
        if (msgKey !== null) {
            var userId = Xrm.Utility.getGlobalContext().userSettings.userId;
            userId = userId.replace("{", "");
            userId = userId.replace("}", "");
            var query = "usersettingscollection(" + userId + ")?$select=uilanguageid";
            var userData = GetData(query);
            if (userData !== null && userData !== undefined) {
                var langCode = userData.uilanguageid;
                var defaultLangCode = 1033;
                var langQuery = "negt_multilingualconfigurations?$select=negt_languagecode,negt_message,negt_messagekey,negt_multilingualconfigurationid,negt_name&$filter=negt_languagecode eq '" + langCode + "' and  negt_messagekey eq '" + msgKey + "'";
                var langData = GetData(langQuery);
                if (langData !== null && langData !== undefined && langData.value.length > 0) {
                    return langData.value[0].negt_message;
                }
                else{
                    var defaultLangQuery = "negt_multilingualconfigurations?$select=negt_languagecode,negt_message,negt_messagekey,negt_multilingualconfigurationid,negt_name&$filter=negt_languagecode eq '" + defaultLangCode + "' and  negt_messagekey eq '" + msgKey + "'";
                    var defaultLangData = GetData(defaultLangQuery);
                    if (defaultLangData !== null && defaultLangData !== undefined && defaultLangData.value.length > 0) {
                        return defaultLangData.value[0].negt_message;
                    }
                }
            }
        }
    } catch (e) {
        Xrm.Navigation.openAlertDialog({
            text: "An error occurred while GetMessageText."
        });
    }
}

/// <summary>
/// Function to apply custom filter to the lookup field. Filter a lookup based on the value of filter specified.
/// </summary>
/// <param name="executionContext">executionContext</param>
function RemoveCustomerFromAccountType(executionContext) {
    "use strict";
    try {
        if (executionContext === null || executionContext === undefined)
            return;
        var formContext = executionContext.getFormContext();
        if (formContext === null || formContext === undefined)
            return;
        var accountTypeValue = null;
        var accountTypeControl = null;
        var accountdId = formContext.data.entity.getId();
        accountdId = accountdId.replace("{", "");
        accountdId = accountdId.replace("}", "");
        if (formContext.getAttribute("accountcategorycode") !== null && formContext.getAttribute("accountcategorycode") !== undefined
             && formContext.getControl("accountcategorycode") !== null && formContext.getControl("accountcategorycode") !== undefined) {
            accountTypeValue = formContext.getAttribute("accountcategorycode").getValue();
            accountTypeControl = formContext.getControl("accountcategorycode");
        }

        var formType = formContext.ui.getFormType();
        if (formType === 1) {
            accountTypeControl.removeOption(2);
        } else if (accountTypeValue !== 2) { // Account Type = Customer
            accountTypeControl.removeOption(2);
        }
    } catch (e) {
        var exMsg = "";
        if (typeof(Storage) !== "undefined") {
            exMsg = sessionStorage.getItem("M29");
        } else {
            exMsg = GetMessageText("M29");
        }
        if (exMsg === "" || exMsg === null) {
            exMsg = GetMessageText("M29");
        }
        Xrm.Navigation.openAlertDialog({
            text: exMsg
        });
    }
}

/// <summary>
/// Function to set default value of account owners BU and country.
/// </summary>
/// <param name="executionContext">executionContext</param>
function SetDefaultTerritory(executionContext) {
    "use strict";
    try {
        if (executionContext === null || executionContext === undefined)
            return;
        var formContext = executionContext.getFormContext();
        if (formContext === null || formContext === undefined)
            return;
        var territoryOfficeLookup = formContext.getAttribute("negt_buid").getValue();
        if (territoryOfficeLookup === null) {
            //var ownerIdLookup = formContext.getAttribute("ownerid").getValue();

            //added by nachiket
            var formType = formContext.ui.getFormType();
            if (formType === 1) {
                var ownerIdLookup = formContext.getAttribute("ownerid").getValue();
            } else {
                if (formContext.getAttribute("negt_ownerid") !== null && formContext.getAttribute("negt_ownerid") !== undefined) {
                    var ownerIdLookup = formContext.getAttribute("negt_ownerid").getValue();
                }
            }
            //added by nachiket

            if (ownerIdLookup !== null) {
                var ownerId = ownerIdLookup[0].id;
                ownerId = ownerId.replace("}", "");
                ownerId = ownerId.replace("{", "");
                var query = "systemusers?$select=_businessunitid_value&$filter=systemuserid eq " + ownerId;
                var userData = GetData(query);
                if (userData !== null && userData !== undefined) {
                    if (userData.value !== undefined) {
                        if (userData.value.length > 0) {
                            var businessUnitId = userData.value[0]["_businessunitid_value"];
                            var businessUnitName = userData.value[0]["_businessunitid_value@OData.Community.Display.V1.FormattedValue"];
                            formContext.getAttribute("negt_buid").setValue([{
                                        id: businessUnitId,
                                        name: businessUnitName,
                                        entityType: "businessunit"
                                    }
                                ]);

                        }
                    }
                }
            }
        }
    } catch (e) {
        var exMsg = "";
        if (typeof(Storage) !== "undefined") {
            exMsg = sessionStorage.getItem("M72");
        } else {
            exMsg = GetMessageText("M72");
        }

        if (exMsg === "" || exMsg === null) {
            exMsg = GetMessageText("M72");
        }

        Xrm.Navigation.openAlertDialog({
            text: exMsg
        });
    }
}

/// <summary>
/// Function to retrieve users data.
/// </summary>
/// <param name="executionContext">executionContext</param>
function GetUserData(formContext, userQuery) {
    "use strict";
    try {
        //var ownerIdLookup = formContext.getAttribute("ownerid").getValue();

        //added by nachiket
        var formType = formContext.ui.getFormType();
        if (formType === 1) {
            var ownerIdLookup = formContext.getAttribute("ownerid").getValue();
        } else {
            if (formContext.getAttribute("negt_ownerid") !== null && formContext.getAttribute("negt_ownerid") !== undefined) {
                var ownerIdLookup = formContext.getAttribute("negt_ownerid").getValue();
            }
        }
        //added by nachiket

        if (ownerIdLookup !== null) {
            var ownerId = ownerIdLookup[0].id;
            ownerId = ownerId.replace("}", "");
            ownerId = ownerId.replace("{", "");
            var query = userQuery + ownerId;
            var userData = GetData(query);
            if (userData !== null && userData !== undefined) {
                if (userData.value !== undefined) {
                    if (userData.value.length > 0) {
                        return userData;
                    }
                }
            }
        }
    } catch (e) {
        var exMsg = "";
        if (typeof(Storage) !== "undefined") {
            exMsg = sessionStorage.getItem("M73");
        } else {
            exMsg = GetMessageText("M73");
        }

        if (exMsg === "" || exMsg === null) {
            exMsg = GetMessageText("M73");
        }

        Xrm.Navigation.openAlertDialog({
            text: exMsg
        });
    }
}

/// <summary>
/// Validate email id
/// </summary>
/// <param name="executionContext">executionContext</param>
function ValidateEmail(executionContext) {

    "use strict";
    try {
        if (executionContext === null || executionContext === undefined)
            return;
        var formContext = executionContext.getFormContext();
        if (formContext === null || formContext === undefined)
            return;

        var emailId = formContext.getAttribute("emailaddress1").getValue();
        //var regExp = /^[_a-zA-Z0-9-]+(\.[_a-zA-Z0-9-]+)*@[a-zA-Z0-9]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,4})$/;

        var regExp = /^[_a-zA-Z0-9-]+(\.[_a-zA-Z0-9-]+)*@(?!.*--)[a-zA-Z0-9-/.?_]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,10})$/;

        if (emailId !== null && emailId !== undefined) {

            if (!regExp.test(emailId)) {
                var errMsg = "";
                if (typeof(Storage) !== "undefined") {
                    errMsg = sessionStorage.getItem("M43");
                } else {
                    errMsg = GetMessageText("M43");
                }

                if (exMsg === "" || exMsg === null) {
                    exMsg = GetMessageText("M43");
                }

                formContext.getControl("emailaddress1").setNotification('Enter a valid email address.');

                //Xrm.Navigation.openAlertDialog({ text: errMsg });

                // setTimeout(function () {
                // formContext.getAttribute("emailaddress1").setValue(null);
                // }, 1000);
            } else {
                formContext.getControl("emailaddress1").clearNotification();
            }
        }
    } catch (e) {
        var exMsg = "";
        if (typeof(Storage) !== "undefined") {
            exMsg = sessionStorage.getItem("M44");
        } else {
            exMsg = GetMessageText("M44");
        }
        if (exMsg === "" || exMsg === null) {
            exMsg = GetMessageText("M44");
        }
        Xrm.Navigation.openAlertDialog({
            text: exMsg
        });
    }
}

/// <summary>
/// Set composite address on change of address field
/// </summary>
/// <param name="executionContext">executionContext</param>
function SetCompositeAddressField(executionContext) {
    "use strict";
    try {
        if (executionContext === null || executionContext === undefined)
            return;
        var formContext = executionContext.getFormContext();
        if (formContext === null || formContext === undefined)
            return;

        var addressText = "";

        if (formContext.getAttribute('address1_line1') !== null && formContext.getAttribute('address1_line1').getValue() !== null)
            addressText += formContext.getAttribute('address1_line1').getValue() + ", ";

        if (formContext.getAttribute('address1_line3') !== null && formContext.getAttribute('address1_line3').getValue() !== null)
            addressText += formContext.getAttribute('address1_line3').getValue() + ", ";

        if (formContext.getAttribute('address1_city') !== null && formContext.getAttribute('address1_city').getValue() !== null)
            addressText += formContext.getAttribute('address1_city').getValue() + ", ";

        if (formContext.getAttribute('address1_stateorprovince') !== null && formContext.getAttribute('address1_stateorprovince').getValue() !== null) {
            var state = formContext.getAttribute("negt_stateid").getValue();
            if (state !== null && state !== undefined) {
                addressText += state[0].name + ", ";
            }
        }

        if (formContext.getAttribute('address1_country') !== null && formContext.getAttribute('address1_country').getValue() !== null) {
            var country = formContext.getAttribute("negt_countryid").getValue();
            if (country !== null && country !== undefined) {
                addressText += country[0].name + ", ";
            }
        }

        if (formContext.getAttribute('address1_postalcode') !== null && formContext.getAttribute('address1_postalcode').getValue() !== null)
            addressText += formContext.getAttribute('address1_postalcode').getValue();

        if (addressText !== "" && formContext.getAttribute('address1_composite') !== null)
            formContext.getAttribute('address1_composite').setValue(addressText);
    } catch (e) {
        var exMsg = "";
        if (typeof(Storage) !== "undefined") {
            exMsg = sessionStorage.getItem("M46");
        } else {
            exMsg = GetMessageText("M46");
        }
        if (exMsg === "" || exMsg === null) {
            exMsg = GetMessageText("M44");
        }
        Xrm.Navigation.openAlertDialog({
            text: exMsg
        });
    }
}

/// <summary>
///  Set mulltilingual messages/alerts in cache
/// </summary>
/// <param name="executionContext">executionContext</param>
function SetCacheForMultilingualMessages() {
    "use strict";
    try {
        if (typeof(Storage) !== "undefined") {
            var arrAccountMessages = ["M2", "M5", "M6", "M7", "M8", "M9", "M10", "M11", "M29", "M43", "M44", "M46", "M72", "M73", "M82", "M83", "M85", "M111", "M127", "M129"];
            // Get the data from cache using user-specific cache key

            var userId = Xrm.Utility.getGlobalContext().userSettings.userId;
            userId = userId.replace("{", "");
            userId = userId.replace("}", "");
            var query = "usersettingscollection(" + userId + ")?$select=uilanguageid";
            var userData = GetData(query);

            if (userData !== null && userData !== undefined) {
                var langCode = userData.uilanguageid;

                SetMessageInsessionStorage(langCode, arrAccountMessages);
            }
        }
    } catch (e) {
        Xrm.Navigation.openAlertDialog({
            text: "An error occurred in SetCacheForMultilingualMessages"
        });
    }
}

function AcceptDunsNumber(executionContext) {
    "use strict";
    try {
        if (executionContext === null || executionContext === undefined)
            return;
        var formContext = executionContext.getFormContext();
        if (formContext === null || formContext === undefined)
            return;

        var dunsNumber = formContext.getAttribute("negt_dandbnumber").getValue();
        var regExp = /^[0-9]{9}$/;

        if (dunsNumber !== null && dunsNumber !== undefined) {

            if (!regExp.test(dunsNumber)) {
                var errMsg = "";
                if (typeof(Storage) !== "undefined") {
                    errMsg = sessionStorage.getItem("M82");
                } else {
                    errMsg = GetMessageText("M82");
                }

                if (exMsg === "" || exMsg === null) {
                    exMsg = GetMessageText("M82");
                }

                Xrm.Navigation.openAlertDialog({
                    text: errMsg
                });
                setTimeout(function () {
                    formContext.getAttribute("negt_dandbnumber").setValue(null);
                }, 1000);
            }
        }
    } catch (e) {
        var exMsg = "";
        if (typeof(Storage) !== "undefined") {
            exMsg = sessionStorage.getItem("M83");
        } else {
            exMsg = GetMessageText("M83");
        }
        if (exMsg === "" || exMsg === null) {
            exMsg = GetMessageText("M83");
        }
        Xrm.Navigation.openAlertDialog({
            text: exMsg
        });
    }
}

function ResyncAccount(primaryControl) {

    "use strict";
    try {
        var exMsg = "";
        var formContext = primaryControl;
        if (formContext !== null && formContext !== undefined) {
            var EntityID = formContext.data.entity.getId();
            if (EntityID !== null && EntityID !== undefined) {
                var entity = {
                    "EntityId": EntityID // accountId
                };
                var WorkflowId = AccountWorkflowId;
                var serverURL = Xrm.Utility.getGlobalContext().getClientUrl();
                var req = new XMLHttpRequest();
                req.open("POST", serverURL + RESTAPIVERSION + "workflows(" + WorkflowId + ")/Microsoft.Dynamics.CRM.ExecuteWorkflow", false);
                req.setRequestHeader("OData-MaxVersion", "4.0");
                req.setRequestHeader("OData-Version", "4.0");
                req.setRequestHeader("Accept", "application/json");
                req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
                req.onreadystatechange = function () {
                    if (this.readyState === 4) {
                        req.onreadystatechange = null;

                        if (this.status === 200 || this.status === 204) {

                            exMsg = GetMessageText("M87");
                            formContext.ui.setFormNotification(exMsg, "INFO", "M87");

                        }
                    }
                };
                req.send(JSON.stringify(entity));

            }

        }

    } catch (e) {
        var eMsg = "";
        if (typeof(Storage) !== "undefined") {
            eMsg = sessionStorage.getItem("M90");
        } else {
            eMsg = GetMessageText("M90");
        }
        if (eMsg === "" || eMsg === null) {
            eMsg = GetMessageText("M90");
        }
        formContext.ui.setFormNotification(eMsg, "INFO", "M90");

    }

}

// ----------- Gurpreet 11-11-2019 ---------------------

// This function will conditional hide/show based on the owner id of the account
// It internally calls GetUserCountry() and HideShowAccountFields() function.

function HideAndShowBasedOnUserCountry(executionContext) {
    "use strict";
    if (executionContext === null || executionContext === undefined)
        return;

    var formContext = executionContext.getFormContext(); // To get the Form Context from the passed execution context

    // This condition checks if the formContext variable is not null or undefined
    if (formContext === null || formContext === undefined)
        return;

    var flag = GetAndCompareUserCountry(executionContext);
    // This function call will hide/show the fields
    HideShowAccountFields(formContext, flag, "accountnamelist", executionContext);
}
function GetAndCompareUserCountry(executionContext) {

    "use strict";
    // This condition checks if the execution context is passed to the fuction from CRM or not
    if (executionContext === null || executionContext === undefined)
        return;

    var formContext = executionContext.getFormContext(); // To get the Form Context from the passed execution context

    // This condition checks if the formContext variable is not null or undefined
    if (formContext === null || formContext === undefined)
        return;

    var globalContext = Xrm.Utility.getGlobalContext(); // To get the Global Context from the passed execution context

    // This condition checks if the formContext variable is not null or undefined
    if (globalContext === null || globalContext === undefined)
        return;

    var userCountry = null; // this variable consists the result fetched from the GetUserCountry function.
    var userCountryName = null; // this variable consists the name of the country name from the "userCountry" result.
    var conditionalCountries = null; // this variable will consists the countries for which we need to conditional show/hide
    var countryArray = []; // empty array to get the countries.
    var countryName = null;
    var column = "negt_value";
    var value = "countryname";
    var flag = false; // this variable consists the boolean value which will be used to verify if the country is prsent of not.
    conditionalCountries = GetConfigValue(executionContext, column, value);
    userCountry = GetUserCountry(executionContext);
    if (conditionalCountries.value[0]["negt_value"] !== null && conditionalCountries.value[0]["negt_value"] !== undefined) {
        countryName = conditionalCountries.value[0]["negt_value"].toLowerCase();
        countryArray = countryName.split(',');
    }
    if (userCountry.value[0]["_negt_countryid_value@OData.Community.Display.V1.FormattedValue"] !== null && userCountry.value[0]["_negt_countryid_value@OData.Community.Display.V1.FormattedValue"] !== undefined) {
        userCountryName = userCountry.value[0]["_negt_countryid_value@OData.Community.Display.V1.FormattedValue"].toLowerCase();
    }
    for (var i = 0; i < countryArray.length; i++) {
        if (userCountryName === countryArray[i].toLowerCase()) {
            flag = true;
        }
    }
    //Russia OptOut
    var russianCountries = null;
    var russCountryArray = []; // empty array to get the countries.
    var russCountryNames = null;
    var russiaFlag = false; 

    russianCountries= GetConfigValue(executionContext, column, "RussiaSpecificChanges");
    if (russianCountries.value[0]["negt_value"] !== null && russianCountries.value[0]["negt_value"] !== undefined) {
        russCountryNames = russianCountries.value[0]["negt_value"].toLowerCase();
        russCountryArray = russCountryNames.split(',');
    }
    for (var i = 0; i < russCountryArray.length; i++) {
        if (userCountryName === russCountryArray[i].toLowerCase()) {
            russiaFlag = true;
            break;
        }
    }

    if(russiaFlag)
    {
        ShowHideOptOutRussia(executionContext);
    }
    return flag;

}

//Update 04 August 2020
function ShowHideOptOutRussia(executionContext) {
    "use strict";

    // This condition checks if the execution context is passed to the fuction from CRM or not
    if (executionContext === null || executionContext === undefined)
        return;

    var formContext = executionContext.getFormContext(); // To get the Form Context from the passed execution context

    // This condition checks if the formContext variable is not null or undefined
    if (formContext === null || formContext === undefined)
        return;

    var globalContext = Xrm.Utility.getGlobalContext(); // To get the Global Context from the passed execution context

    // This condition checks if the formContext variable is not null or undefined
    if (globalContext === null || globalContext === undefined)
        return;

    var formType = formContext.ui.getFormType();
    if (formType === 1) {
        if (formContext.getControl("negt_isoptout") !== null && formContext.getControl("negt_isoptout") !== undefined) {
            formContext.getControl("negt_isoptout").setVisible(true);
        }
        if (formContext.getControl("negt_reasonoptout") !== null && formContext.getControl("negt_reasonoptout") !== undefined) {
            formContext.getControl("negt_reasonoptout").setVisible(true);
        }
    } else {
        formContext.getControl("negt_isoptout").setVisible(true);
        formContext.getControl("negt_reasonoptout").setVisible(true);
    }
}

// This function will fetch the user country based on the ownerid(systemuserid).
// It internally calls GetUserOwnerId() function
function GetUserCountry(executionContext) {
    "use strict";

    // This condition checks if the execution context is passed to the fuction from CRM or not
    if (executionContext === null || executionContext === undefined)
        return;

    var formContext = executionContext.getFormContext(); // To get the Form Context from the passed execution context

    // This condition checks if the formContext variable is not null or undefined
    if (formContext === null || formContext === undefined)
        return;

    var globalContext = Xrm.Utility.getGlobalContext(); // To get the Global Context from the passed execution context

    // This condition checks if the formContext variable is not null or undefined
    if (globalContext === null || globalContext === undefined)
        return;

    var results = null; // this variable consists of the fetched results.
    var ownerId = null; // this variable consists of the ownerid of the account.
    ownerId = GetUserOwnerId(formContext);

    // Fetch query
    try {
        var req = new XMLHttpRequest();
        req.open("GET", globalContext.getClientUrl() + "/api/data/v9.1/systemusers?$select=domainname,_negt_countryid_value&$filter=systemuserid eq " + ownerId + "", false);
        req.setRequestHeader("OData-MaxVersion", "4.0");
        req.setRequestHeader("OData-Version", "4.0");
        req.setRequestHeader("Accept", "application/json");
        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        req.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
        req.onreadystatechange = function () {
            if (this.readyState === 4) {
                req.onreadystatechange = null;
                if (this.status === 200) {
                    results = JSON.parse(this.response);
                } else {
                    Xrm.Utility.alertDialog(this.statusText);
                }
            }
        };
        req.send();
    } catch (e) {
        Xrm.Navigation.openAlertDialog({
            text: "Error Occured while executing the GetUserCountry ...."
        });
    }
    return results;
}

// This function will fetch the owner id based on the owner field present in the account.
function GetUserOwnerId(formContext) {
    "use strict";
    try {
        if (formContext.getAttribute("ownerid") !== null && formContext.getAttribute("ownerid") !== undefined) {

            //added by nachiket
            var formType = formContext.ui.getFormType();
            if (formType === 1) {
                var ownerIdLookup = formContext.getAttribute("ownerid").getValue();
            } else {
                if (formContext.getAttribute("negt_ownerid") !== null && formContext.getAttribute("negt_ownerid") !== undefined) {
                    var ownerIdLookup = formContext.getAttribute("negt_ownerid").getValue();
                }
            }
            //added by nachiket
            //var ownerIdLookup = formContext.getAttribute("ownerid").getValue();
            if (ownerIdLookup !== null) {
                var ownerId = ownerIdLookup[0].id;
                ownerId = ownerId.replace("}", "");
                ownerId = ownerId.replace("{", "");

                return ownerId;
            }
        }

    } catch (e) {
        Xrm.Navigation.openAlertDialog({
            text: "Error Occured while executing the GetUserDomainId ...."
        });
    }

}

// This function will hide/show the account fields based on the user country.
function HideShowAccountFields(formContext, flag, configName, executionContext) {

    "use strict";

    var column = "negt_value";
    var value = configName;
    var fieldsString = "";
    var fieldsStringArray = []; // array which will store the fields.
    var configValue = GetConfigValue(executionContext, column, value); // variable which will store the fields.
    if (configValue.value[0]["negt_value"] !== null && configValue.value[0]["negt_value"] !== undefined) {
        fieldsString = configValue.value[0]["negt_value"].toLowerCase();
    }
    var control = null; // variable which will store the control to hide/show.
    // If country is germany,
    fieldsStringArray = fieldsString.split(',');
    for (var i = 0; i < fieldsStringArray.length; i++) {
        control = fieldsStringArray[i];
        if (formContext.getControl(control) !== null && formContext.getControl(control) !== undefined) {
            formContext.getControl(control).setVisible(flag);
        }

    }
}

// --------------------- end -------------------------------
function GetConfigValue(executionContext, column, value) {

    "use strict";
    try {
        var field = "negt_name";
        var results = null;
        var req = new XMLHttpRequest();
        req.open("GET", Xrm.Page.context.getClientUrl() + "/api/data/v9.1/negt_configurationentities?$select=" + column + "&$filter=" + field + " eq '" + value + "'", false);
        req.setRequestHeader("OData-MaxVersion", "4.0");
        req.setRequestHeader("OData-Version", "4.0");
        req.setRequestHeader("Accept", "application/json");
        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        req.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
        req.onreadystatechange = function () {
            if (this.readyState === 4) {
                req.onreadystatechange = null;
                if (this.status === 200) {
                    results = JSON.parse(this.response);
                } else {
                    Xrm.Utility.alertDialog(this.statusText);
                }
            }
        };
        req.send();
    } catch (e) {
        Xrm.Navigation.openAlertDialog({
            text: "Error Occured while executing the GetConfigValue ...."
        });
    }
    return results;
}

function setAccountNameToAccountNameOne(executionContext) {
    "use strict";
    try {
        if (executionContext === null || executionContext === undefined)
            return;
        var formContext = executionContext.getFormContext();
        if (formContext === null || formContext === undefined)
            return;
        var flag = GetAndCompareUserCountry(executionContext);
        if (!flag) {
            if (formContext.getAttribute("name") !== null && formContext.getAttribute("name") !== undefined) {
                var accountName = formContext.getAttribute("name").getValue();
                if (accountName !== null && accountName !== undefined && formContext.getAttribute("negt_accountname1") !== null && formContext.getAttribute("negt_accountname1") !== undefined) {
                    formContext.getAttribute("negt_accountname1").setValue(accountName);
                }
            }
        }
    } catch (e) {
        Xrm.Navigation.openAlertDialog({
            text: "Error Occured while executing the setAccountNameToAccountNameOne ...."
        });
    }
}

function CheckFieldLength(executionContext) {
    "use strict";
    try {
        if (executionContext === null || executionContext === undefined)
            return;
        var formContext = executionContext.getFormContext();
        if (formContext === null || formContext === undefined)
            return;
        if (formContext.getAttribute("negt_accountname1") !== null && formContext.getAttribute("negt_accountname1") !== undefined) {
            var accountNameOne = formContext.getAttribute("negt_accountname1").getValue();
            var flag = GetAndCompareUserCountry(executionContext);
            if (flag) {
                if (accountNameOne !== null && accountNameOne !== undefined) {
                    if (accountNameOne.length > AccountName1Length) {

                        var eMsg = GetMessageText("M111");
                        Xrm.Navigation.openAlertDialog({
                            text: eMsg
                        });
                        formContext.getAttribute("negt_accountname1").setValue(null);
                    }
                }
            }

        }
    } catch (e) {
        Xrm.Navigation.openAlertDialog({
            text: "Error Occured while executing the CheckFieldLength ...."
        });
    }

}

function DisableButton(primaryControl) {
    "use strict";
    try {
        var formContext = primaryControl;
        if (formContext === null || formContext === undefined)
            return;
        if (formContext.getAttribute("negt_isresyncclicked") !== null && formContext.getAttribute("negt_isresyncclicked") !== undefined) {
            formContext.getAttribute("negt_isresyncclicked").setValue(true);
            formContext.data.entity.save();
            formContext.ui.refreshRibbon();
            setTimeout(function () {
                formContext.ui.clearFormNotification("M87");
                formContext.getAttribute("negt_isresyncclicked").setValue(false);
                formContext.data.entity.save();
                formContext.ui.refreshRibbon();
            }, 15000);
        }
    } catch (e) {
        Xrm.Navigation.openAlertDialog({
            text: "Error Occured while executing the DisableButton ...."
        });
    }
}

function SetIsResyncFalse(executionContext) {
    "use strict";
    try {
        if (executionContext === null || executionContext === undefined)
            return;
        var formContext = executionContext.getFormContext();
        if (formContext === null || formContext === undefined)
            return;

        var formType = formContext.ui.getFormType();
        if (formType === 2) {
            if (formContext.getAttribute("negt_isresyncclicked") !== null && formContext.getAttribute("negt_isresyncclicked") !== undefined)
                var isResynClicked = formContext.getAttribute("negt_isresyncclicked").getValue();
            if (isResynClicked === null || isResynClicked === true) {
                formContext.getAttribute("negt_isresyncclicked").setValue(false);
                formContext.data.entity.save();
            }
        }
    } catch (e) {
        Xrm.Navigation.openAlertDialog({
            text: "Error occured while executing the SetIsResyncFalse"
        });
    }
}

/// <summary>
/// NavigateToElogOnClick
/// </summary>
/// <param name="executionContext">Execution Context</param>
function NavigateToElogOnClick(executionContext) {
    "use strict";

    try {
        if (executionContext === null || executionContext === undefined)
            return;

        var accId = executionContext.data.entity.getId();
        if (accId !== null || accId !== undefined) {
            accId = accId.replace("{", "");
            accId = accId.replace("}", "");

            var globalContext = Xrm.Utility.getGlobalContext();
            var loggedInUserId = globalContext.userSettings.userId.substring(1, 37);

            var elogIdUserCountryQuery = "negt_countries?fetchXml=%3Cfetch%20version%3D%221.0%22%20output-format%3D%22xml-platform%22%20mapping%3D%22logical%22%20distinct%3D%22true%22%3E%3Centity%20name%3D%22negt_country%22%3E%3Cattribute%20name%3D%22negt_countryid%22%20%2F%3E%3Cattribute%20name%3D%22negt_elogcompanyid%22%20%2F%3E%3Corder%20attribute%3D%22negt_name%22%2F%3E%3Clink-entity%20name%3D%22systemuser%22%20from%3D%22negt_countryid%22%20to%3D%22negt_countryid%22%20link-type%3D%22inner%22%20alias%3D%22ad%22%3E%3Cfilter%20type%3D%22and%22%3E%3Ccondition%20attribute%3D%22systemuserid%22%20operator%3D%22eq%22%20uitype%3D%22systemuser%22%20value%3D%22%7B" + loggedInUserId + "%7D%22%20%2F%3E%3C%2Ffilter%3E%3C%2Flink-entity%3E%3C%2Fentity%3E%3C%2Ffetch%3E";
            var elogIdUserCountryData = GetData(elogIdUserCountryQuery);

            if (elogIdUserCountryData !== undefined) {
                if (elogIdUserCountryData.value !== undefined) {
                    if (elogIdUserCountryData.value.length > 0) {
                        if (elogIdUserCountryData.value[0].negt_elogcompanyid !== null) {
                            var companyID = elogIdUserCountryData.value[0].negt_elogcompanyid;
                            var eLogUrl = GetConfigurationKeyValue("ACCELOGURI");
                            var elogUrl = eLogUrl + "&CID=" + companyID + "&CRMGUID=" + accId;
                            Xrm.Navigation.openUrl(elogUrl);
                        }
                    }
                }
            }

        }
    } catch (error) {
        var exMsg = "";
        if (typeof(Storage) !== "undefined") {
            exMsg = sessionStorage.getItem("M42");
        } else {
            exMsg = GetMessageText("M42");
        }
        if (exMsg === "" || exMsg === null) {
            exMsg = GetMessageText("M42");
        }
        Xrm.Navigation.openAlertDialog({
            text: exMsg
        });
    }
}

/// <summary>
/// GetConfigurationKeyValue
/// </summary>
/// <param name="executionContext">executionContext</param>
function GetConfigurationKeyValue(key) {
    "use strict";
    var configValue = null;
    var query = "negt_configurationentities?$select=negt_value&$filter=negt_name eq '" + key + "'";
    var configData = GetData(query);
    if (configData !== null && configData !== undefined) {
        if (configData.value !== undefined) {
            if (configData.value.length > 0) {
                if (configData.value[0]["negt_value"] !== null && configData.value[0]["negt_value"] !== undefined) {
                    configValue = configData.value[0]["negt_value"];
                }
            }
        }
    }
    return configValue;
}

/// <summary>
/// Set defualt user country and state
/// </summary>
/// <param name="executionContext">executionContext</param>
function SetDefaultCountry(executionContext) {
    "use strict";
    try {
        if (executionContext === null || executionContext === undefined)
            return;
        var formContext = executionContext.getFormContext();
        if (formContext === null || formContext === undefined)
            return;

        var countryLookup = formContext.getAttribute("negt_countryid").getValue();
        var stateLookup = formContext.getAttribute("negt_stateid").getValue();

        if (countryLookup === null || stateLookup === null) {
            //added by nachiket
            var formType = formContext.ui.getFormType();
            if (formType === 1) {
                var ownerIdLookup = formContext.getAttribute("ownerid").getValue();
            } else {
                if (formContext.getAttribute("negt_ownerid") !== null && formContext.getAttribute("negt_ownerid") !== undefined) {
                    var ownerIdLookup = formContext.getAttribute("negt_ownerid").getValue();
                }
            }
            //added by nachiket
            if (ownerIdLookup !== null) {
                var ownerId = ownerIdLookup[0].id;
                ownerId = ownerId.replace("}", "");
                ownerId = ownerId.replace("{", "");
                var query = "systemusers?$select=_negt_countryid_value,_negt_stateid_value,_negt_installationareaid_value,_negt_pricingareaid_value&$expand=negt_countryid($select=negt_name,_negt_parentcountryid_value,statecode)&$filter=systemuserid eq " + ownerId;
                var userData = GetData(query);
                if (userData !== null && userData !== undefined) {
                    if (userData.value !== undefined) {
                        if (userData.value.length > 0) {
                            var parentCountryId = null;
                            var parentCountryName = null;
                            var countryId = null;
                            var countryName = null;
                            var countryStatus = null;
                            //Get parentCountryid and parentCountryname
                            if(userData.value[0].negt_countryid._negt_parentcountryid_value !== null && userData.value[0].negt_countryid._negt_parentcountryid_value !== undefined){
                                parentCountryId = userData.value[0].negt_countryid._negt_parentcountryid_value;
                                parentCountryName = userData.value[0].negt_countryid["_negt_parentcountryid_value@OData.Community.Display.V1.FormattedValue"];
                            }
                            //Get countryid and countryname
                            if (userData.value[0]["_negt_countryid_value"] !== null && userData.value[0]["_negt_countryid_value"] !== undefined) {
                                countryId = userData.value[0]["_negt_countryid_value"];
                                countryName = userData.value[0]["_negt_countryid_value@OData.Community.Display.V1.FormattedValue"];
                                countryStatus = userData.value[0].negt_countryid.statecode;
                            }
                            //Check country lookup is null
                            if (countryLookup === null) {
                                //Check parent country contains data
                                if(parentCountryId !== null && parentCountryId !== undefined && countryStatus === 0){
                                    //Set country lookup as parent country
                                    formContext.getAttribute("negt_countryid").setValue([{
                                        id: parentCountryId,
                                        name: parentCountryName,
                                        entityType: "negt_country"
                                    }]); 
                                }
                                //Check country contains data
                                else if(countryId !== null && countryId !== undefined && countryStatus === 0){
                                    //Set country lookup as country
                                    formContext.getAttribute("negt_countryid").setValue([{
                                        id: countryId,
                                        name: countryName,
                                        entityType: "negt_country"
                                    }]); 
                                }  
                            }
                            //Get stateid and statename 
                            if(userData.value[0]["_negt_stateid_value"] !== null && userData.value[0]["_negt_stateid_value"] !== undefined){
                                var stateId = userData.value[0]["_negt_stateid_value"];
                                var stateName = userData.value[0]["_negt_stateid_value@OData.Community.Display.V1.FormattedValue"];
                                //Check state lookup is null
                                if(stateLookup === null && countryStatus === 0){
                                    //Set state lookup
                                    formContext.getAttribute("negt_stateid").setValue([{
                                        id: stateId,
                                        name: stateName,
                                        entityType: "negt_state"
                                    }]);
                                }
                            }
                        }
                    }
                }
            }
        }
    } catch (e) {
        var exMsg = "";
        if (typeof(Storage) !== "undefined") {
            exMsg = sessionStorage.getItem("M74");
        } else {
            exMsg = GetMessageText("M74");
        }
        if (exMsg === "" || exMsg === null) {
            exMsg = GetMessageText("M74");
        }
        Xrm.Navigation.openAlertDialog({
            text: exMsg
        });
    }
}
/// <summary>
/// Filter Contact Lookup
/// </summary>
/// <param name="executionContext">executionContext</param>
function FilterContactLookup(formContext, countryId) {

    try {

        var negt_elogcompanyid = "";
        if (countryId !== null && countryId !== undefined && countryId !== "") {
            var qry = "negt_countries?$select=negt_elogcompanyid&$filter=negt_countryid eq " + countryId;
            var Data = GetData(qry);
            if (Data !== null && Data !== undefined) {
                if (Data.value !== undefined) {
                    if (Data.value.length > 0) {
                        if (Data.value[0]["negt_elogcompanyid"] !== null && Data.value[0]["negt_elogcompanyid"] !== undefined) {
                            negt_elogcompanyid = Data.value[0]["negt_elogcompanyid"];
                        }
                    }
                }
            }
        }
        if (negt_elogcompanyid !== null && negt_elogcompanyid !== undefined && negt_elogcompanyid !== "") {

            //Custom view for contact field
            //var viewId1 = "{00000000-0000-0000-0000-000000000004}";
            var viewId1 = formContext.getControl("primarycontactid").getDefaultView();
            var viewDisplayName1 = "Owner Country Wise Contact";

            var entityName1 = "contact";
            var viewIsDefault1 = true;

            var fetch1 = "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'>" +
                "<entity name='contact'>" +
                "<attribute name='fullname' />" +
                "<attribute name='telephone1' />" +
                "<attribute name='contactid' />" +
                "<attribute name='emailaddress1' />" +
                "<attribute name='address1_city' />" +
                "<attribute name='negt_countryid' />" +
                "<attribute name='parentcustomerid' />" +
                "<attribute name='address1_telephone1' />" +
                "<order attribute='fullname' descending='false' />" +
                "<filter type='and'>" +
                "<condition attribute='statecode' operator='eq' value='0' />" +
                "</filter>" +
                "<link-entity name='account' from='accountid' to='parentcustomerid' link-type='inner' alias='ao'>" +
                "<filter type='and'>" +
                "<condition attribute='negt_mkdenialcode' operator='ne' value='10001' />" +
                "<condition attribute='statecode' operator='eq' value='0' />" +
                "</filter>" +
                "</link-entity>" +
                "<link-entity name='systemuser' from='systemuserid' to='negt_ownerid' link-type='inner' alias='ae'>" +
                "<link-entity name='negt_country' from='negt_countryid' to='negt_countryid' link-type='inner' alias='af'>" +
                "<filter type='and'>" +
                "<condition attribute='negt_elogcompanyid' operator='eq' value='" + negt_elogcompanyid + "' />" +
                "</filter>" +
                "</link-entity>" +
                "</link-entity>" +
                "</entity>" +
                "</fetch>";

            var layoutXml1 = "<grid name='resultset' object='1' jump='name' select='1' icon='1' preview='1'>" +
                "<row name='result' id='contactid'>" +
                "<cell name='fullname' width='200' />" +
                "<cell name='emailaddress1' width='200' />" +
                "<cell name='telephone1' width='200' />" +
                "<cell name='parentcustomerid' width='200' />" +
                "<cell name='address1_city' width='200' />" +
                "<cell name='negt_countryid' width='200' />" +
                "<cell name='address1_telephone1' width='200' />" +
                "</row>" +
                "</grid>";

            formContext.getAttribute("primarycontactid").controls.forEach(
                function (control, i) {
                control.addCustomView(viewId1, entityName1, viewDisplayName1, fetch1, layoutXml1, viewIsDefault1);
            });
        }
    } catch (e) {
        var exMsg = "";
        if (typeof(Storage) !== "undefined") {
            exMsg = sessionStorage.getItem("M127");
        } else {
            exMsg = GetMessageText("M127");
        }
        if (exMsg === "" || exMsg === null) {
            exMsg = GetMessageText("M127");
        }
        Xrm.Navigation.openAlertDialog({
            text: GetMessageText("M127")
        });
    }
}

/// <summary>
/// Filter Account Vertical
/// </summary>
/// <param name="executionContext">executionContext</param>
function FilterAccountVertical(formContext, countryId) {

    try {

        var formType = formContext.ui.getFormType();
        if (formType === 1) {
            var ownerid = formContext.getAttribute("ownerid").getValue();
        } else {
            if (formContext.getAttribute("negt_ownerid") !== null && formContext.getAttribute("negt_ownerid") !== undefined) {
                var ownerid = formContext.getAttribute("negt_ownerid").getValue();
            }
        }
        //added by nachiket

        if (ownerid !== null && ownerid !== undefined) {
            if (formContext.getControl("negt_accountverticalid") !== null && formContext.getControl("negt_accountverticalid") !== undefined) {
                //formContext.getControl("negt_accountverticalid").addPreSearch(FilterAccountVerticalLookup);
                formContext.getControl("negt_accountverticalid").addPreSearch(function () {
                    FilterAccountVerticalLookup(formContext, countryId);
                });
            }
        } else {
            //formContext.getControl("negt_accountverticalid").removePreSearch(FilterAccountVerticalLookup);
            formContext.getControl("negt_accountverticalid").removePreSearch(function () {
                FilterAccountVerticalLookup(formContext, countryId);
            });
        }
    } catch (e) {
        var exMsg = "";
        if (typeof(Storage) !== "undefined") {
            exMsg = sessionStorage.getItem("M129");
        } else {
            exMsg = GetMessageText("M129");
        }
        if (exMsg === "" || exMsg === null) {
            exMsg = GetMessageText("M129");
        }
        Xrm.Navigation.openAlertDialog({
            text: exMsg
        });
    }
}
function FilterAccountVerticalLookup(formContext, countryId) {
    "use strict";

    try {
        if (countryId !== null && countryId !== undefined) {
            var fetchXml = "<filter type='and'><condition attribute='negt_countryid' operator='eq' value='" + countryId + "' /></filter>";
            formContext.getControl("negt_accountverticalid").addCustomFilter(fetchXml);
        }
    } catch (e) {
        var exMsg = "";
        if (typeof(Storage) !== "undefined") {
            exMsg = sessionStorage.getItem("M129");
        } else {
            exMsg = GetMessageText("M129");
        }
        if (exMsg === "" || exMsg === null) {
            exMsg = GetMessageText("M129");
        }
        Xrm.Navigation.openAlertDialog({
            text: exMsg
        });
    }
}

/// <summary>
/// Hide/Show Company Hit Rate, Company Opportunity Amount, Company: Otis Basis-of-Design %  fields if Account has some child accounts
/// </summary>
/// <param name="executionContext">executionContext</param>
function HideAndShowParentAccountStatisticsFields(executionContext) {
    "use strict";

    try {

        if (executionContext === null || executionContext === undefined)
            return;
        var formContext = executionContext.getFormContext();
        if (formContext === null || formContext === undefined)
            return;
        var formType = formContext.ui.getFormType();
        if (formType === 2 || formType === 3 || formType === 4) {
            var accId = formContext.data.entity.getId();
            if (accId !== null || accId !== undefined) {
                accId = accId.replace("{", "");
                accId = accId.replace("}", "");

                var isChildAccount = false;
                var qry = "accounts?$select=parentaccountid&$filter=_parentaccountid_value eq " + accId;
                var Data = GetData(qry);
                if (Data !== null && Data !== undefined) {
                    if (Data.value !== undefined) {
                        if (Data.value.length > 0) {
                            isChildAccount = true;
                            //  if (Data.value[0]["negt_elogcompanyid"] !== null && Data.value[0]["negt_elogcompanyid"] !== undefined) {
                            // negt_elogcompanyid = Data.value[0]["negt_elogcompanyid"];
                            // }
                        }
                    }
                }

                HideShowAccountFields(formContext, isChildAccount, "ParentAccountStatisticsFields", executionContext);
            }
        } else if (formType === 1) {
            HideShowAccountFields(formContext, false, "ParentAccountStatisticsFields", executionContext);
        }
    } catch (e) {
        var exMsg = "";
        if (typeof(Storage) !== "undefined") {
            exMsg = sessionStorage.getItem("M134");
        } else {
            exMsg = GetMessageText("M134");
        }
        if (exMsg === "" || exMsg === null) {
            exMsg = GetMessageText("M134");
        }
        Xrm.Navigation.openAlertDialog({
            text: exMsg
        });
    }
}


function GetConfigValue(executionContext, column, value) {

    "use strict";
    try {
        var field = "negt_name";
        var results = null;
        var req = new XMLHttpRequest();
        req.open("GET", Xrm.Page.context.getClientUrl() + "/api/data/v9.1/negt_configurationentities?$select=" + column + "&$filter=" + field + " eq '" + value + "'", false);
        req.setRequestHeader("OData-MaxVersion", "4.0");
        req.setRequestHeader("OData-Version", "4.0");
        req.setRequestHeader("Accept", "application/json");
        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        req.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
        req.onreadystatechange = function () {
            if (this.readyState === 4) {
                req.onreadystatechange = null;
                if (this.status === 200) {
                    results = JSON.parse(this.response);
                } else {
                    Xrm.Utility.alertDialog(this.statusText);
                }
            }
        };
        req.send();
    } catch (e) {
        Xrm.Navigation.openAlertDialog({
            text: "Error Occured while executing the GetConfigValue ...."
        });
    }
    return results;
}


//Clear Reason of Opt-Out
//21 July 2020
//Update 04 August 2020
function clearReasonOfOptOut(executionContext) {
    "use strict";
    var formContext = executionContext.getFormContext();
    var isOptOut = formContext.getAttribute("negt_isoptout").getValue();
    if(isOptOut !== null && isOptOut !== undefined) {
        if(isOptOut === true || isOptOut === "Yes") {
            formContext.getControl("negt_reasonoptout").setDisabled(false);
            formContext.getAttribute("negt_reasonoptout").setValue(null);
            formContext.getAttribute("negt_reasonoptout").setRequiredLevel("required");

            var exMsg = "";
            if (typeof(Storage) !== "undefined") {
                exMsg = sessionStorage.getItem("M137");
            } else {
                exMsg = GetMessageText("M137");
            }
            if (exMsg === "" || exMsg === null) {
                exMsg = GetMessageText("M137");
            }
            Xrm.Navigation.openAlertDialog({
                text: exMsg
            });
        } else {
            formContext.getControl("negt_reasonoptout").setDisabled(true);
            formContext.getAttribute("negt_reasonoptout").setValue(null);
            formContext.getAttribute("negt_reasonoptout").setRequiredLevel("none");
        }
    }
}


///
///
///
///
function SetMessageInsessionStorage(langCode, arrAccountMessages) {
    "use strict"

    try {

        var fetchXml = "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'>" +
            "  <entity name='negt_multilingualconfiguration'>" +
            "    <attribute name='negt_messagekey' />" +
            "    <attribute name='negt_message' />" +
            "    <attribute name='negt_multilingualconfigurationid' />" +
            "    <filter type='and'>" +
            "      <condition attribute='negt_messagekey' operator='in'>";
        for (var i = 0; i < arrAccountMessages.length; i++) {
            fetchXml += "<value>" + arrAccountMessages[i] + "</value>"
        }
        fetchXml += "</condition>" +
        "      <condition attribute='negt_languagecode' operator='eq' value='" + langCode + "' />" +
        "    </filter>" +
        "  </entity>" +
        "</fetch>";

        var req = new XMLHttpRequest();
        req.open("GET", Xrm.Page.context.getClientUrl() + "/api/data/v9.1/negt_multilingualconfigurations?fetchXml= " + fetchXml, false);
        req.setRequestHeader("OData-MaxVersion", "4.0");
        req.setRequestHeader("OData-Version", "4.0");
        req.setRequestHeader("Accept", "application/json");
        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        req.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
        req.onreadystatechange = function () {
            if (this.readyState === 4) {
                req.onreadystatechange = null;
                if (this.status === 200) {
                    var results = JSON.parse(this.response);
                    for (var i = 0; i < results.value.length; i++) {
                        var negt_messagekey = results.value[i]["negt_messagekey"];
                        var negt_message = results.value[i]["negt_message"];
                        var msg = sessionStorage.getItem(negt_messagekey);
                        if (msg === null || msg === undefined) {
                            sessionStorage.setItem(negt_messagekey, negt_message);
                        }
                    }
                } else {
                    Xrm.Utility.alertDialog(this.statusText);
                }
            }
        };
        req.send();

    } catch (error) {
        Xrm.Navigation.openAlertDialog({
            text: "An error occurred while SetMessageInsessionStorage."
        });
    }
}


