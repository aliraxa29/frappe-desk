import type { ListResponse, DocTypeMetaResponse, Document } from "../types";
import { resource } from "../utils/resource";
import { toast } from "../stores/toast";

class FrappeClient {
  private handleError(message: string, error: any): void {
    console.error(message, error);
    const errorMsg = error?.message || error?.exc || String(error);
    toast.error(message, errorMsg);
  }

  async createDocument(
    doctype: string,
    data: Record<string, any>,
  ): Promise<Document> {
    try {
      const response = await resource.call({
        method: "frappe.client.insert",
        args: {
          doc: { ...data, doctype },
        },
      });
      return response.message;
    } catch (error) {
      this.handleError(`Failed to create ${doctype}`, error);
      throw error;
    }
  }

  async updateDocument(
    doctype: string,
    name: string,
    data: Record<string, any>,
  ): Promise<Document> {
    try {
      const response = await resource.call({
        method: "frappe.client.set_value",
        args: {
          doctype,
          name,
          fieldname: data,
        },
      });
      return response.message;
    } catch (error) {
      this.handleError(`Failed to update ${doctype} "${name}"`, error);
      throw error;
    }
  }

  async deleteDocument(doctype: string, name: string): Promise<void> {
    try {
      await resource.call({
        method: "frappe.client.delete",
        args: {
          doctype,
          name,
        },
      });
      toast.success(`${doctype} "${name}" deleted`);
    } catch (error) {
      this.handleError(`Failed to delete ${doctype} "${name}"`, error);
      throw error;
    }
  }

  async getList(
    doctype: string,
    options?: {
      fields?: string[];
      filters?: Record<string, any>;
      limit_page_length?: number;
      limit_start?: number;
      order_by?: string;
    },
  ): Promise<ListResponse> {
    try {
      const response = await resource.call({
        method: "frappe.client.get_list",
        args: {
          doctype,
          fields: options?.fields || ["name"],
          filters: options?.filters || [],
          limit_page_length: options?.limit_page_length || 20,
          limit_start: options?.limit_start || 0,
          order_by: options?.order_by || "modified desc",
        },
      });
      return {
        data: response.message || [],
      } as ListResponse;
    } catch (error) {
      console.error(`Failed to fetch ${doctype} list:`, error);
      throw error;
    }
  }

  async callMethod(method: string, args?: Record<string, any>): Promise<any> {
    try {
      const response = await resource.call({
        method,
        args: args || {},
      });
      return response.message;
    } catch (error) {
      this.handleError(`Failed to call method ${method}`, error);
      throw error;
    }
  }

  async getInstalledApps(): Promise<string[]> {
    try {
      const response = await resource.call({
        method: "frappe.client.get_list",
        args: {
          doctype: "Desk App",
          fields: ["name"],
        },
      });
      return (response.message || []).map((app: any) => app.name);
    } catch (error) {
      this.handleError("Failed to fetch installed apps", error);
      return [];
    }
  }

  async getAppDoctypes(app: string): Promise<string[]> {
    try {
      const response = await resource.call({
        method: "frappe.client.get_list",
        args: {
          doctype: "DocType",
          filters: [["module", "=", app]],
          fields: ["name"],
        },
      });
      return (response.message || []).map((item: any) => item.name);
    } catch (error) {
      this.handleError(`Failed to fetch doctypes for ${app}`, error);
      return [];
    }
  }

  async hasPermission(
    doctype: string,
    action: string = "read",
  ): Promise<boolean> {
    try {
      const response = await resource.call({
        method: "frappe.client.has_permission",
        args: {
          doctype,
          perm_type: action,
        },
      });
      return response.message?.has_permission || false;
    } catch (error) {
      console.error(`Failed to check permission for ${doctype}:`, error);
      return false;
    }
  }

  async getValue(doctype: string, name: string, field: string): Promise<any> {
    try {
      const response = await resource.call({
        method: "frappe.client.get_value",
        args: {
          doctype,
          name,
          fieldname: field,
        },
      });
      return response.message?.value;
    } catch (error) {
      this.handleError(
        `Failed to get value for ${doctype}.${name}.${field}`,
        error,
      );
      throw error;
    }
  }
}

export const frappeClient = new FrappeClient();
